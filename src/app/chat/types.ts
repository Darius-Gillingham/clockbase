// File: src/app/chat/types.ts
// Commit: Message type definition for current in-memory chat messages

export interface Message {
  userId: string
  username: string
  text: string
  timestamp: number
}
