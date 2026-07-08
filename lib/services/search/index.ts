import { tavily } from "@tavily/core";

/**
 * Perform an advanced web search using Tavily API to gather relevant sources for a user query.
 */
export async function performAdvancedSearch(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("TAVILY_API_KEY is not set. Returning empty search results.");
    return [];
  }

  const client = tavily({ apiKey });
  const response = await client.search(query, {
    searchDepth: "advanced",
  });

  return response.results;
}
