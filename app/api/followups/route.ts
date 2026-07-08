import { NextResponse } from "next/server";
import z from "zod";
import { authenticateUser } from "@/lib/services/auth";
import { streamFollowUpAsk } from "@/lib/services/ai/followup";

const requestSchema = z.object({
  query: z.string({ message: "query is required" }),
  conversationId: z.string({ message: "conversationId is required" }),
});

export async function POST(req: Request) {
  try {
    const userId = await authenticateUser(req);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Request body is missing." },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { error: "Request body is missing." },
        { status: 400 }
      );
    }

    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { query, conversationId } = parseResult.data;
    const streamResponse = await streamFollowUpAsk(
      query,
      conversationId,
      userId
    );

    if (!streamResponse) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return streamResponse;
  } catch (e) {
    console.error("Error in POST /api/followups:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
