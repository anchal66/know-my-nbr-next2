// src/app/messages/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/state/store'
import { Button } from '@/components/ui/button'

import {
  getConversations,
  getMessages,
  sendMessageREST,
  Conversation,
  Message,
  PaginatedResponse,
} from '@/lib/conversations'

export default function MessagesPage() {
  // 1) Auth check
  const { token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  // 2) Local state
  const [loading, setLoading] = useState(false)

  // Instead of just Conversation[], store the paginated result
  const [conversationPage, setConversationPage] =
    useState<PaginatedResponse<Conversation> | null>(null)

  // We'll still keep a separate array for the "display" if you prefer:
  // or you can do conversationPage?.content inside the render
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  // For messages, also store the *paginated* object
  const [messagesPage, setMessagesPage] =
    useState<PaginatedResponse<Message> | null>(null)

  // For now, we keep a separate "display" array of messages
  const [messages, setMessages] = useState<Message[]>([])

  const [messageContent, setMessageContent] = useState('')

  // We'll track the *server-based* page index (0-based in Spring):
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 20

  // Fetch conversations on mount
  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    fetchAllConversations(0) // start at page=0
  }, [token, router])

  async function fetchAllConversations(page: number) {
    try {
      setLoading(true)
      const data = await getConversations(page, pageSize)
      setConversationPage(data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // Select Conversation & load messages
  // ----------------------------------------------------------------
  async function handleSelectConversation(matchId: string) {
    setSelectedMatchId(matchId)
    // reset to page=0 for messages
    setCurrentPage(0)
    await fetchMessages(matchId, 0)
  }

  async function fetchMessages(matchId: string, page: number) {
    try {
      setLoading(true)
      const data = await getMessages(matchId, page, pageSize)
      setMessagesPage(data)

      if (page === 0) {
        // fresh load
        setMessages(data.content)
      } else {
        // appending older messages at the *beginning* or *end* depends on your UI
        // If your UI wants older messages prepended, do:
        setMessages((prev) => [...data.content, ...prev])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // 5-second polling: once a conversation is selected, reload page=0
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!selectedMatchId) return
    const interval = setInterval(() => {
      // re-fetch page=0 for latest messages
      fetchMessages(selectedMatchId, 0)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedMatchId])

  // ----------------------------------------------------------------
  // Loading older messages
  // ----------------------------------------------------------------
  function handleLoadOlder() {
    if (!selectedMatchId || !messagesPage) return

    // next page on the server is (messagesPage.number + 1)
    const nextPage = messagesPage.number + 1
    // Only load if we haven't hit the last page
    if (!messagesPage.last) {
      setCurrentPage(nextPage)
      fetchMessages(selectedMatchId, nextPage)
    }
  }

  // ----------------------------------------------------------------
  // Sending messages via REST
  // ----------------------------------------------------------------
  async function handleSendMessage() {
    if (!selectedMatchId || !messageContent.trim()) return
    try {
      setLoading(true)
      // Send new message (REST)
      const newMsg = await sendMessageREST(selectedMatchId, messageContent)
      // Append to chat (the new message is presumably the newest)
      setMessages((prev) => [...prev, newMsg])
      setMessageContent('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // Render the page
  // ----------------------------------------------------------------
  if (!token) {
    return <p className="p-4">Redirecting to login...</p>
  }

  // Possibly get the conversation list from conversationPage?.content
  const conversationList = conversationPage?.content || []

  return (
    <div className="flex flex-col md:flex-row w-full h-[80vh] p-4 gap-4">
      {/* Left: Conversation List */}
      <div className="w-full md:w-1/3 border border-gray-300 rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Messages</h2>
        {loading && conversationList.length === 0 && (
          <p className="text-sm text-gray-500">Loading conversations...</p>
        )}

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversationList.map((conv: any) => {
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
                  <p className="text-xs text-gray-600 truncate">
                    {lastMsg.content}
                  </p>
                ) : (
                  <span className="text-xs text-blue-500">New</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Example: pagination controls for conversations (if you want them) */}
        <div className="mt-2 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || (conversationPage?.first ?? true)}
            onClick={() => {
              if (!conversationPage) return
              const prevPage = conversationPage.number - 1
              if (prevPage >= 0) {
                fetchAllConversations(prevPage)
              }
            }}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || (conversationPage?.last ?? true)}
            onClick={() => {
              if (!conversationPage) return
              const nextPage = conversationPage.number + 1
              if (!conversationPage.last) {
                fetchAllConversations(nextPage)
              }
            }}
          >
            Next
          </Button>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadOlder}
                disabled={loading || messagesPage?.last}
              >
                Load Older
              </Button>
              {loading && <p className="text-sm text-gray-500">Loading...</p>}
            </div>

            <div className="flex-1 overflow-y-auto mb-2 border-t pt-2 space-y-2">
              {messages.map((msg) => {
                // Adjust to check if it's your user
                const isMine = false // or (msg.fromUserId === yourUserId)
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMine ? 'justify-end' : 'justify-start'
                    }`}
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

