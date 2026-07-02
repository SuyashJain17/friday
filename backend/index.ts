import { tavily } from '@tavily/core'
import express from "express";
import z from "zod"
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';
import { middleware } from './middleware';
import cors from "cors";
import { prisma } from './db';

// Configure OpenAI provider, using Vercel AI Gateway if key is present
const openaiProvider = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    ...(process.env.AI_GATEWAY_API_KEY ? { baseURL: 'https://ai-gateway.vercel.sh/v1' } : {})
});
const openaiModel = openaiProvider('gpt-4o');

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
const app = express();

app.use(express.json());
app.use(cors());

// Get all conversations for the authenticated user
app.get("/conversations", middleware, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.userId! },
            orderBy: { id: "desc" },
            select: {
                id: true,
                title: true,
                slug: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: "asc" },
                    select: { content: true, createdAt: true }
                }
            }
        });

        res.json({ conversations });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
})

// Get messages for a specific conversation
app.get("/conversations/:conversationId", middleware, async (req, res) => {
    try {
        const conversationId = req.params.conversationId as string;

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.userId!,
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        res.json({ conversation });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
})


app.post("/friday_ask", middleware, async (req, res) => {
    const requestSchema = z.object({
        query: z.string({
            message: "query must be a string and is required"
        })
    });

    if (!req.body) {
        res.status(400).json({ error: "Request body is missing. Make sure you send JSON with 'Content-Type: application/json' header." });
        return;
    }

    const parseResult = requestSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.format() });
        return;
    }

    // Step 1 - get the query from the user
    const { query } = parseResult.data;

    // Step 2 - create a conversation and persist the user message
    const slug = query
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);

    const conversation = await prisma.conversation.create({
        data: {
            title: query.slice(0, 200),
            slug,
            userId: req.userId!,
            messages: {
                create: {
                    content: query,
                    role: "User",
                }
            }
        }
    });

    // Step 3 - web search to gather resources
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });

    const webSearchResult = webSearchResponse.results;

    // Step 4 - do context engineering on the prompt + web search responses
    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query);

    // Step 5 - hit the LLM and stream back the response
    const result = await streamText({
        model: openaiModel,
        prompt: prompt,
        system: SYSTEM_PROMPT,
    });

    res.header('Cache-Control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')

    let fullResponse = "";
    for await (const textPart of result.textStream) {
        fullResponse += textPart;
        res.write(textPart);
    }

    const sourcesJson = JSON.stringify(webSearchResult.map(r => ({ url: r.url, title: r.title })));

    // Step 6 - persist the assistant's response with sources
    await prisma.message.create({
        data: {
            content: fullResponse + `\n<SOURCES>\n${sourcesJson}\n<SOURCES>\n`,
            role: "Assistance",
            conversationId: conversation.id,
        }
    });

    res.write("\n<SOURCES>\n");
    res.write(sourcesJson);
    res.write("\n<SOURCES>\n");

    // Step 8 - send the conversation id so the frontend can use it for follow-ups
    res.write("\n<CONVERSATION_ID>\n");
    res.write(conversation.id);
    res.write("\n<CONVERSATION_ID>\n");

    // Step 9 - close the event stream
    res.end()
})

app.post("/friday_ask/follow_up", middleware, async (req, res) => {
    const requestSchema = z.object({
        query: z.string({ message: "query is required" }),
        conversationId: z.string({ message: "conversationId is required" }),
    });

    if (!req.body) {
        res.status(400).json({ error: "Request body is missing." });
        return;
    }

    const parseResult = requestSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.format() });
        return;
    }

    const { query, conversationId } = parseResult.data;

    // Step 1 - get the existing conversation and its messages from the db
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: req.userId!,
        },
        include: {
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
    }

    // Step 2 - persist the new user message
    await prisma.message.create({
        data: {
            content: query,
            role: "User",
            conversationId,
        }
    });

    // Step 3 - do a fresh web search for the follow-up query
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });
    const webSearchResult = webSearchResponse.results;

    // Step 4 - build conversation history for context
    const chatHistory = conversation.messages
        .map(m => `${m.role === "User" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", `## Conversation History\n${chatHistory}\n\n## Follow-up Question\n${query}`);

    // Step 5 - hit the LLM and stream the response
    const result = await streamText({
        model: openaiModel,
        prompt: prompt,
        system: SYSTEM_PROMPT,
    });

    res.header('Cache-Control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')

    let fullResponse = "";
    for await (const textPart of result.textStream) {
        fullResponse += textPart;
        res.write(textPart);
    }

    const sourcesJson = JSON.stringify(webSearchResult.map(r => ({ url: r.url, title: r.title })));

    // Step 6 - persist the assistant's response with sources
    await prisma.message.create({
        data: {
            content: fullResponse + `\n<SOURCES>\n${sourcesJson}\n<SOURCES>\n`,
            role: "Assistance",
            conversationId,
        }
    });

    res.write("\n<SOURCES>\n");
    res.write(sourcesJson);
    res.write("\n<SOURCES>\n");

    // Step 7 - close the stream
    res.end()
})

// Update conversation title
app.patch("/conversations/:conversationId", middleware, async (req, res) => {
    try {
        const conversationId = req.params.conversationId as string;
        const { title } = req.body;

        if (!title || typeof title !== 'string' || !title.trim()) {
            res.status(400).json({ error: "Title is required" });
            return;
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.userId!,
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        const updated = await prisma.conversation.update({
            where: { id: conversationId },
            data: { title: title.trim().slice(0, 200) }
        });

        res.json({ success: true, conversation: updated });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update conversation" });
    }
});

// Delete a conversation and its messages
app.delete("/conversations/:conversationId", middleware, async (req, res) => {
    try {
        const conversationId = req.params.conversationId as string;

        // Verify the conversation belongs to the user first
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.userId!,
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        // Delete all messages in the conversation
        await prisma.message.deleteMany({
            where: { conversationId }
        });

        // Delete the conversation
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

// Export conversation as plain text
app.get("/conversations/:conversationId/export", middleware, async (req, res) => {
    try {
        const conversationId = req.params.conversationId as string;

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.userId!,
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        let exportText = `Friday Conversation Export\n`;
        exportText += `Title: ${conversation.title || 'Untitled Search'}\n`;
        exportText += `Date: ${conversation.messages[0]?.createdAt.toLocaleDateString() || ''}\n`;
        exportText += `========================================\n\n`;

        for (const msg of conversation.messages) {
            exportText += `${msg.role === 'User' ? 'You' : 'Friday'}:\n${msg.content}\n\n`;
            exportText += `----------------------------------------\n\n`;
        }

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="conversation-${conversationId}.txt"`);
        res.send(exportText);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to export conversation" });
    }
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});