import { NextResponse } from "next/server";
import z from "zod";
import { authenticateUser } from "@/lib/services/auth";
import { streamInitialAsk } from "@/lib/services/ai/ask";

const requestSchema = z.object({
  query: z.string({
    message: "query must be a string and is required",
  }),
});

export async function POST(req: Request) {
  try {
    const userId = await authenticateUser(req);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Request body is missing. Make sure you send JSON with 'Content-Type: application/json' header.",
        },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        {
          error:
            "Request body is missing. Make sure you send JSON with 'Content-Type: application/json' header.",
        },
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

    const { query } = parseResult.data;
    return await streamInitialAsk(query, userId);
  } catch (e) {
    console.error("Error in POST /api/ask:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
