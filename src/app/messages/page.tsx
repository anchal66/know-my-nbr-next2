// src/app/messages/page.tsx

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { Button } from '@/components/ui/button'

import {
  getConversations,
  getMessages,
  Conversation,
  Message,
} from '@/lib/conversations'
import { initStompClient, sendStompMessage } from '@/lib/stompClient'
import { Client, IMessage } from '@stomp/stompjs'

export default function MessagesPage() {
  // 1) Auth check
  const { token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // 2) Local state
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // 3) STOMP client reference
  const stompClientRef = useRef<Client | null>(null)

  // ----------------------------------------------------------------
  // 4) On mount, check login, init STOMP, fetch convos
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    const initStomp = () => {
      const client = initStompClient({
        token,
        onConnected: () => console.log('[STOMP] Connected'),
        onDisconnected: () => console.log('[STOMP] Disconnected'),
        onError: (err) => console.error('[STOMP] Error:', err),
      })
      stompClientRef.current = client
    }  
    initStomp()  // set up STOMP only once
    fetchAllConversations()

    // Cleanup: deactivate STOMP on unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
      }
    }
  }, [token, router])

  async function fetchAllConversations() {
    try {
      setLoading(true)
      const data = await getConversations()
      setConversations(data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // 5) STOMP init & subscription logic
  // ----------------------------------------------------------------
  function initStomp() {
    // Pass token for "Authorization: Bearer <token>"
    const client = initStompClient({
      token,
      onConnected: () => console.log('[STOMP] Connected'),
      onDisconnected: () => console.log('[STOMP] Disconnected'),
      onError: (err) => console.error('[STOMP] Error:', err),
    })
    stompClientRef.current = client
  }

  // Whenever selectedMatchId changes, re-subscribe to that conversation
  useEffect(() => {
    if (!selectedMatchId || !stompClientRef.current) return

    // Subscribe to /topic/conversations/{matchId}
    const sub = stompClientRef.current.subscribe(
      `/topic/conversations/${selectedMatchId}`,
      (msg: IMessage) => {
        try {
          const newMessage = JSON.parse(msg.body) as Message
          // Append new messages from the server
          setMessages((prev) => [...prev, newMessage])
        } catch (err) {
          console.error('Failed to parse incoming STOMP message:', err)
        }
      }
    )

    return () => {
      // Unsubscribe on conversation change
      sub.unsubscribe()
    }
  }, [selectedMatchId])

  // ----------------------------------------------------------------
  // 6) Selecting a conversation & fetching messages
  // ----------------------------------------------------------------
  async function handleSelectConversation(matchId: string) {
    setSelectedMatchId(matchId)
    setCurrentPage(1)
    await fetchMessages(matchId, 1)
  }

  async function fetchMessages(matchId: string, page: number) {
    try {
      setLoading(true)
      const data = await getMessages(matchId, page, pageSize)
      if (page === 1) {
        setMessages(data)
      } else {
        setMessages((prev) => [...data, ...prev])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleLoadOlder() {
    if (!selectedMatchId) return
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchMessages(selectedMatchId, nextPage)
  }

  // ----------------------------------------------------------------
  // 7) Sending messages with STOMP
  // ----------------------------------------------------------------
  function handleSendMessage() {
    if (!selectedMatchId || !messageContent.trim()) return
    if (!stompClientRef.current) return

    // This calls the helper in `stompClient.ts`:
    sendStompMessage(stompClientRef.current, selectedMatchId, messageContent)

    // Optionally do an optimistic update. The server will also push back the final message.
    // ...
    setMessageContent('')
  }

  // ----------------------------------------------------------------
  // 8) Render the page with Tailwind styling
  // ----------------------------------------------------------------
  if (!token) {
    return <p className="p-4">Redirecting to login...</p>
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-[80vh] p-4 gap-4">
      {/* Left: Conversation List */}
      <div className="w-full md:w-1/3 border border-gray-300 rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Messages</h2>
        {loading && !conversations.length && (
          <p className="text-sm text-gray-500">Loading conversations...</p>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => {
            const isActive = selectedMatchId === conv.matchId
            const lastMsg = conv.recentMessages?.[0]
            return (
              <div
                key={conv.matchId}
                onClick={() => handleSelectConversation(conv.matchId)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold">{conv.name}</p>
                {lastMsg ? (
                  <p className="text-xs text-gray-600 truncate">{lastMsg.content}</p>
                ) : (
                  <span className="text-xs text-blue-500">New</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Chat messages */}
      <div className="w-full md:flex-1 border border-gray-300 rounded-lg p-4 flex flex-col">
        {!selectedMatchId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <Button variant="outline" size="sm" onClick={handleLoadOlder} disabled={loading}>
                Load Older
              </Button>
              {loading && <p className="text-sm text-gray-500">Loading...</p>}
            </div>

            <div className="flex-1 overflow-y-auto mb-2 border-t pt-2 space-y-2">
              {messages.map((msg) => {
                // Adjust to check if it's your user
                const isMine = false
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <p
                      className={`inline-block px-3 py-2 rounded-md max-w-xs break-words ${
                        isMine
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Send box */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="default"
                disabled={loading || !messageContent.trim()}
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
