import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import {
  getConversationById,
  updateConversationTitle,
  deleteConversationAndMessages,
} from "@/lib/services/conversation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const userId = await authenticateUser(req);
    const { id } = await context.params;

    const conversation = await getConversationById(id, userId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const userId = await authenticateUser(req);
    const { id } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { title } = body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const updated = await updateConversationTitle(id, userId, title);
    if (!updated) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, conversation: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const userId = await authenticateUser(req);
    const { id } = await context.params;

    const deleted = await deleteConversationAndMessages(id, userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
