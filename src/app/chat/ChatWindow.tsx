'use client'

import { useEffect, useRef } from 'react'
import { Message } from './types'

interface ChatWindowProps {
  messages: Message[]
  currentUserId: string
}

export default function ChatWindow({ messages, currentUserId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-grow overflow-y-auto px-4 py-3 space-y-2 bg-white dark:bg-gray-900 text-black dark:text-white">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`max-w-sm px-4 py-2 rounded-lg shadow ${
            msg.userId === currentUserId
              ? 'bg-green-600 text-white ml-auto'
              : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white mr-auto'
          }`}
        >
          <div className="text-xs opacity-60 mb-1">{msg.username}</div>
          <div className="break-words">{msg.text}</div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
