import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/services/auth";
import {
  getConversationById,
  formatConversationExportText,
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

    const exportText = formatConversationExportText(conversation);

    return new Response(exportText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="conversation-${id}.txt"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to export conversation" },
      { status: 500 }
    );
  }
}
