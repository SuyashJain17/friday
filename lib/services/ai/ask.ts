import { streamText } from "ai";
import { prisma } from "../../db";
import { performAdvancedSearch } from "../search";
import { getOpenAIModel } from "./model";
import { SYSTEM_PROMPT, PROMPT_TEMPLATE } from "./prompt";
import {
  createReadableStream,
  encodeChunk,
  createEventStreamResponse,
} from "../../stream";

/**
 * Orchestrate initial AI query pipeline: create conversation, search web, engineering prompt,
 * stream response chunks via Web Streams API, and persist messages.
 */
export async function streamInitialAsk(query: string, userId: string): Promise<Response> {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const conversation = await prisma.conversation.create({
    data: {
      title: query.slice(0, 200),
      slug,
      userId,
      messages: {
        create: {
          content: query,
          role: "User",
        },
      },
    },
  });

  const webSearchResult = await performAdvancedSearch(query);

  const prompt = PROMPT_TEMPLATE
    .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
    .replace("{{USER_QUERY}}", query);

  const openaiModel = getOpenAIModel();
  const result = streamText({
    model: openaiModel,
    prompt: prompt,
    system: SYSTEM_PROMPT,
  });

  const stream = createReadableStream(async (controller) => {
    let fullResponse = "";
    for await (const textPart of result.textStream) {
      fullResponse += textPart;
      controller.enqueue(encodeChunk(textPart));
    }

    const sourcesJson = JSON.stringify(
      webSearchResult.map((r: any) => ({ url: r.url, title: r.title }))
    );

    await prisma.message.create({
      data: {
        content: fullResponse + `\n<SOURCES>\n${sourcesJson}\n</SOURCES>\n`,
        role: "Assistance",
        conversationId: conversation.id,
      },
    });

    controller.enqueue(encodeChunk("\n<SOURCES>\n"));
    controller.enqueue(encodeChunk(sourcesJson));
    controller.enqueue(encodeChunk("\n</SOURCES>\n"));

    controller.enqueue(encodeChunk("\n<CONVERSATION_ID>\n"));
    controller.enqueue(encodeChunk(conversation.id));
    controller.enqueue(encodeChunk("\n</CONVERSATION_ID>\n"));
  });

  return createEventStreamResponse(stream);
}
