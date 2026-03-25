import type { ID, UserRole } from "@/types/core";

export type Message = {
  id: ID;
  conversationId: ID;
  senderId: ID;
  senderRole: UserRole;
  body: string;
  sentAtIso: string;
  status: "sent" | "delivered" | "read";
};

export type ConversationParticipant = {
  id: ID;
  role: UserRole;
  name: string;
  avatar: string | null;
  subtitle: string; // e.g., specialty or school
};

export type Conversation = {
  id: ID;
  participants: [ConversationParticipant, ConversationParticipant];
  lastMessagePreview: string;
  lastMessageAtIso: string;
  unreadCount: number;
};

