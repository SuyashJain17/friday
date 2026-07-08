import { createOpenAI } from "@ai-sdk/openai";

/**
 * Configure OpenAI provider, prioritizing Vercel AI Gateway if key is present,
 * exactly preserving the model instantiation from backend/index.ts.
 */
export function getOpenAIModel() {
  const openaiProvider = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
    ...(process.env.AI_GATEWAY_API_KEY
      ? { baseURL: "https://ai-gateway.vercel.sh/v1" }
      : {}),
  });

  return openaiProvider("gpt-4o");
}
