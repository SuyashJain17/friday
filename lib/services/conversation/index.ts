import { prisma } from "../../db";

/**
 * Fetch all conversations for a specific user ID.
 * Exactly preserves the query structure and ordering of the original Express implementation.
 */
export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true },
      },
    },
  });

  return conversations
    .sort((a, b) => {
      const timeA = a.messages[0]?.createdAt?.getTime() || 0;
      const timeB = b.messages[0]?.createdAt?.getTime() || 0;
      return timeB - timeA;
    })
    .slice(0, 50);
}

/**
 * Fetch a single conversation along with its ordered messages for a specific user.
 */
export async function getConversationById(id: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * Update the title of a specific conversation belonging to the user.
 */
export async function updateConversationTitle(id: string, userId: string, title: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!conversation) {
    return null;
  }

  return prisma.conversation.update({
    where: { id },
    data: { title: title.trim().slice(0, 200) },
  });
}

/**
 * Delete a conversation and all its associated messages if it belongs to the user.
 */
export async function deleteConversationAndMessages(id: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!conversation) {
    return false;
  }

  await prisma.message.deleteMany({
    where: { conversationId: id },
  });

  await prisma.conversation.delete({
    where: { id },
  });

  return true;
}

/**
 * Format conversation history into plain text export string, matching Express export formatting.
 */
export function formatConversationExportText(conversation: {
  id: string;
  title: string | null;
  messages: Array<{ role: string; content: string; createdAt: Date }>;
}): string {
  let exportText = `Friday Conversation Export\n`;
  exportText += `Title: ${conversation.title || "Untitled Search"}\n`;
  exportText += `Date: ${conversation.messages[0]?.createdAt.toLocaleDateString() || ""}\n`;
  exportText += `========================================\n\n`;

  for (const msg of conversation.messages) {
    exportText += `${msg.role === "User" ? "You" : "Friday"}:\n${msg.content}\n\n`;
    exportText += `----------------------------------------\n\n`;
  }

  return exportText;
}

