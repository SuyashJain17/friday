import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import { getUserConversations } from "@/lib/services/conversation";

export async function GET(req: Request) {
  try {
    const userId = await authenticateUser(req);
    const conversations = await getUserConversations(userId);
    return NextResponse.json({ conversations });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
