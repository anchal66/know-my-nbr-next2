'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import Image from 'next/image'

import { RootState } from '@/state/store'
import { Button } from '@/components/ui/button'

// Import from the new service file
import {
  getConversations,
  getMessages,
  sendMessageREST,
  Conversation,
  Message,
  PaginatedResponse,
} from '@/lib/conversations'

/**
 * MessagesPage:
 * - Mobile: shows either conversation list OR chat screen
 * - Desktop: shows conversation list (left) and chat (right) side-by-side
 * - Accepts ?matchId= in the query to auto-open that conversation
 * - Highlights selected conversation in brand-gold (with black text)
 * - Displays the conversation partner’s avatar (the first image with orderNo=1, if any)
 */

export default function MessagesPage() {
  // 1) Auth + Onboarding check (example logic)
  const { onBoardingStatus, token } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchIdParam = searchParams.get('matchId')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paginated conversation list
  const [conversationPage, setConversationPage] =
    useState<PaginatedResponse<Conversation> | null>(null)

  // Currently selected conversation
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  // Messages for the selected conversation
  const [messagesPage, setMessagesPage] =
    useState<PaginatedResponse<Message> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // For sending a new message
  const [messageContent, setMessageContent] = useState('')

  // Pagination states
  const [conversationCurrentPage, setConversationCurrentPage] = useState(0)
  const pageSize = 20

  // ----------------------------------------------------------------
  // On mount => Check login + onboarding => fetch conversation list
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!token) {
      router.push('/login')
      return
    }
    if (onBoardingStatus !== 'FINISHED') {
      // redirect user if needed
      router.push('/onboarding/profile')
      return
    }

    // fetch initial conversation list
    fetchAllConversations(0)
  }, [token, onBoardingStatus, router])

  // ----------------------------------------------------------------
  // If ?matchId=someId is given, auto-select that conversation
  // ----------------------------------------------------------------
  useEffect(() => {
    if (matchIdParam && matchIdParam !== selectedMatchId) {
      handleSelectConversation(matchIdParam)
    }
  }, [matchIdParam])

  // ----------------------------------------------------------------
  // 1) Fetch all conversations
  // ----------------------------------------------------------------
  async function fetchAllConversations(page: number) {
    try {
      setLoading(true)
      setError(null)
      const data = await getConversations(page, pageSize)
      setConversationPage(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  // Pagination for conversation list
  function handleConvoPrev() {
    if (!conversationPage) return
    const prevPage = conversationPage.number - 1
    if (prevPage >= 0) {
      setConversationCurrentPage(prevPage)
      fetchAllConversations(prevPage)
    }
  }
  function handleConvoNext() {
    if (!conversationPage) return
    if (!conversationPage.last) {
      const nextPage = conversationPage.number + 1
      setConversationCurrentPage(nextPage)
      fetchAllConversations(nextPage)
    }
  }

  // ----------------------------------------------------------------
  // 2) Select conversation & fetch messages
  // ----------------------------------------------------------------
  async function handleSelectConversation(matchId: string) {
    setSelectedMatchId(matchId)
    // Reset messages page index to 0
    await fetchMessages(matchId, 0)
  }

  async function fetchMessages(matchId: string, page: number) {
    try {
      setLoading(true)
      setError(null)
      const data = await getMessages(matchId, page, pageSize)
      setMessagesPage(data)
      if (page === 0) {
        // fresh load
        setMessages(data.content)
      } else {
        // appending older messages
        setMessages((prev) => [...data.content, ...prev])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // 3) Polling for new messages (every 5s, if a chat is selected)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!selectedMatchId) return
    const interval = setInterval(() => {
      fetchMessages(selectedMatchId, 0)
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedMatchId])

  // ----------------------------------------------------------------
  // 4) Load older messages => next page
  // ----------------------------------------------------------------
  function handleLoadOlder() {
    if (!selectedMatchId || !messagesPage) return
    if (!messagesPage.last) {
      const nextPage = messagesPage.number + 1
      fetchMessages(selectedMatchId, nextPage)
    }
  }

  // ----------------------------------------------------------------
  // 5) Send a new message
  // ----------------------------------------------------------------
  async function handleSendMessage() {
    if (!selectedMatchId || !messageContent.trim()) return
    try {
      setLoading(true)
      const newMsg = await sendMessageREST(selectedMatchId, messageContent)
      setMessages((prev) => [...prev, newMsg])
      setMessageContent('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  const conversationList = conversationPage?.content || []

  return (
    <div className="min-h-screen bg-neutral-900 text-brand-white p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-brand-gold">
        Messages
      </h1>

      {error && (
        <p className="text-brand-red mb-2">
          {error}
        </p>
      )}

      <div className="flex flex-col md:flex-row w-full h-[80vh] gap-4">
        {/* 
          Conversation List
          MOBILE: shown only if no conversation is selected
          DESKTOP: always shown (md:flex)
        */}
        <div
          className={`
            md:w-1/3 border border-gray-700 rounded-lg bg-neutral-800
            flex flex-col
            ${selectedMatchId ? 'hidden md:flex' : 'flex'} 
          `}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-brand-gold">Your Chats</h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            {loading && conversationList.length === 0 && (
              <p className="text-sm text-gray-400 p-2">Loading conversations...</p>
            )}

            {conversationList.map((conv: any) => {
              // Determine if this conversation is selected
              const isActive = selectedMatchId === conv.matchId

              // Attempt to find the first media with orderNo=1 for avatar
              const avatarUrl = conv.media
                ?.find((m:any) => m.type === 'IMAGE' && m.orderNo === 1)?.url

              // Last message from recentMessages
              const lastMsg = conv.recentMessages?.[0]

              return (
                <div
                  key={conv.matchId}
                  onClick={() => handleSelectConversation(conv.matchId)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg cursor-pointer
                    transition-colors 
                    ${isActive
                      ? 'bg-brand-gold text-black'
                      : 'hover:bg-neutral-700'
                    }
                  `}
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={avatarUrl}
                        alt="avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isActive ? 'bg-black text-brand-gold' : 'bg-brand-gold text-black'}
                      `}
                    >
                      {/* Fallback initial */}
                      {conv.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className={`font-semibold ${isActive ? 'text-black' : 'text-brand-white'}`}>
                      {conv.name}
                    </p>
                    {lastMsg ? (
                      <p
                        className={`
                          text-xs truncate
                          ${isActive ? 'text-black/80' : 'text-gray-400'}
                        `}
                      >
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p
                        className={`
                          text-xs
                          ${isActive ? 'text-black/80' : 'text-green-400'}
                        `}
                      >
                        New conversation
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination for conversation list */}
          <div className="p-2 flex justify-between border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
              disabled={loading || conversationPage?.first}
              onClick={handleConvoPrev}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
              disabled={loading || conversationPage?.last}
              onClick={handleConvoNext}
            >
              Next
            </Button>
          </div>
        </div>

        {/* 
          Chat Box
          MOBILE: shown only if a conversation is selected
          DESKTOP: always shown (md:flex)
        */}
        <div
          className={`
            md:flex-1 border border-gray-700 rounded-lg bg-neutral-800
            flex flex-col
            ${selectedMatchId ? 'flex' : 'hidden md:flex'}
          `}
        >
          {/* If no conversation is selected (desktop fallback) */}
          {!selectedMatchId && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}

          {selectedMatchId && (
            <>
              {/* Mobile "Back" button (only visible on small screens) */}
              <div className="md:hidden p-2 border-b border-gray-700">
                <Button variant="secondary" size="sm" onClick={() => setSelectedMatchId(null)}>
                  &larr; Back
                </Button>
              </div>

              {/* Load older messages */}
              <div className="p-2 flex items-center justify-between border-b border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300"
                  onClick={handleLoadOlder}
                  disabled={loading || messagesPage?.last}
                >
                  Load Older
                </Button>
                {loading && <p className="text-sm text-gray-400">Loading...</p>}
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {messages.length === 0 && !loading ? (
                  <p className="text-center text-gray-500 mt-4">No messages yet.</p>
                ) : (
                  messages.map((msg) => {
                    // Example check if it's your message
                    const isMine = false // replace with actual logic, e.g. msg.fromUserId === yourUserId
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <p
                          className={`
                            inline-block px-3 py-2 rounded-md max-w-xs break-words
                            ${isMine
                              ? 'bg-brand-gold text-black'
                              : 'bg-neutral-700 text-gray-100'
                            }
                          `}
                        >
                          {msg.content}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Send box */}
              <div className="p-2 border-t border-gray-700 flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-600 bg-neutral-700 rounded-md px-3 py-2 text-white"
                  placeholder="Type a message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={loading}
                />
                <Button
                  variant="default"
                  className="bg-brand-gold text-black hover:brightness-110"
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
    </div>
  )
}
