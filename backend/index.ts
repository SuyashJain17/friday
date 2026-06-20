import { tavily } from '@tavily/core'
import express from "express";
import z from "zod"
import { Output, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';
const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
const app = express();

app.use(express.json());

//signup
app.post("/signup", async (req, res) => {

})

//signin
app.post("/signin", async (req, res) => {

})

// Past conversation get
app.get("/conversations", async (req, res) => {

})

// Past conversation get
app.post("/conversations/:conversationId", async (req, res) => {

})

const requestSchema = z.object({
    query: z.string({
        required_error: "query is required",
        invalid_type_error: "query must be a string"
    })
});

app.post("/perplexity_ask", async (req, res) => {
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
    // Step 2 - make sure user has access/credits to hit the endpoint 

    // Step 3 - check if we have web search indexed for a similar query 

    // Step 4 - web search to gather resources
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });

    const webSearchResult = webSearchResponse.results;
    // Step 5 - do some context engg on the prompt + web search responses

    // Step 6 - hit the LLM and stream back the response
    const prompt = PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query);

    const result = await streamText({
        model: openai('gpt-4o'),
        prompt: prompt,
        system: SYSTEM_PROMPT,
    });

    res.header('Cache-Control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')
    for await (const textPart of result.textStream) {
        res.write(textPart);
    }

    res.write("\n<SOURCES>\n");

    // Step 7 - also stream back the sources and follow up questions (which we can get from another parallel LLM call)
    res.write(JSON.stringify(webSearchResult.map(result => ({ url: result.url }))));

    res.write("\n<SOURCES>\n");
    // Step 8 - close the event stream 
    res.end()
})

app.post("/perplexity_ask/follow_up", async (req, res) => {
    // Step 1- get the existing chat from the db,
    // Step 2- Forward the full history to the LLM 
    // Step 2.5 - TODO: - Do context engg here.
    // Step 3- Stream the response to the user.  
})

app.listen(3000);