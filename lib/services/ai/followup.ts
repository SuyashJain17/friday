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
import { getConversationById } from "../conversation";

/**
 * Orchestrate follow-up AI query pipeline: verify conversation ownership, persist new user message,
 * perform search on follow-up query, build chat history context, and stream response.
 */
export async function streamFollowUpAsk(
  query: string,
  conversationId: string,
  userId: string
): Promise<Response | null> {
  const conversation = await getConversationById(conversationId, userId);
  if (!conversation) {
    return null;
  }

  await prisma.message.create({
    data: {
      content: query,
      role: "User",
      conversationId,
    },
  });

  const webSearchResult = await performAdvancedSearch(query);

  const chatHistory = conversation.messages
    .map((m: any) => `${m.role === "User" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const prompt = PROMPT_TEMPLATE
    .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
    .replace(
      "{{USER_QUERY}}",
      `## Conversation History\n${chatHistory}\n\n## Follow-up Question\n${query}`
    );

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
        conversationId,
      },
    });

    controller.enqueue(encodeChunk("\n<SOURCES>\n"));
    controller.enqueue(encodeChunk(sourcesJson));
    controller.enqueue(encodeChunk("\n</SOURCES>\n"));
    controller.enqueue(encodeChunk(`\n<CONVERSATION_ID>\n${conversationId}\n</CONVERSATION_ID>\n`));
  });

  return createEventStreamResponse(stream);
}
