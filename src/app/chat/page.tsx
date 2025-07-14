// File: src/app/chat/page.tsx
// Commit: Top-level page for live in-memory chat (no persistence yet)

'use client'

import { useSessionContext } from '../SessionProvider'
import { useState } from 'react'
import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'
import { Message } from './types'

export default function ChatPage() {
  const { session } = useSessionContext()
  const [messages, setMessages] = useState<Message[]>([])

  const handleSend = (text: string) => {
    if (!session?.user) return
    const newMsg: Message = {
      userId: session.user.id,
      username: session.user.user_metadata.full_name || 'Anon',
      text,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, newMsg])
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <ChatWindow messages={messages} currentUserId={session?.user?.id || ''} />
      <ChatInput onSend={handleSend} />
    </div>
  )
}
