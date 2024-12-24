// src/lib/stompClient.ts

import { Client, IMessage, IFrame } from '@stomp/stompjs'

interface StompConfig {
  token: string | null
  onConnected?: (frame: IFrame) => void
  onDisconnected?: () => void
  onError?: (err: any) => void
}

/**
 * Initializes a STOMP client for Spring Boot @EnableWebSocketMessageBroker.
 * - Uses the token to set the "Authorization" header.
 * - Subscribes/publishes to your configured endpoints.
 */
export function initStompClient({
  token,
  onConnected,
  onDisconnected,
  onError,
}: StompConfig): Client {
  const brokerURL = process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:8080/ws'

  // Create the STOMP client
  const client = new Client({
    brokerURL,
    // Attach headers for CONNECT
    connectHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    debug: (msg: string) => {
      console.log('[STOMP]', msg)
    },
    onConnect: (frame: IFrame) => {
      console.log('[STOMP] Connected:', frame)
      if (onConnected) onConnected(frame)
    },
    onStompError: (frame) => {
      console.error('[STOMP] Broker error:', frame.headers['message'])
      console.error('[STOMP] Details:', frame.body)
      if (onError) onError(frame)
    },
    onWebSocketError: (event: Event) => {
      console.error('[STOMP] WebSocket error:', event)
      if (onError) onError(event)
    },
    onDisconnect: () => {
      console.log('[STOMP] Disconnected')
      if (onDisconnected) onDisconnected()
    },
  })

  // Activate the client to connect
  client.activate()
  return client
}

/**
 * Helper function to send a new message to /app/chat.sendMessage/{matchId}
 * The server picks it up using @MessageMapping("/chat.sendMessage/{matchId}")
 *
 * @param client The STOMP client
 * @param matchId conversation ID
 * @param content message content
 */
export function sendStompMessage(client: Client, matchId: string, content: string) {
  // Our server is configured with prefix "/app" + your @MessageMapping
  // => "/chat.sendMessage/{matchId}" => final destination: "/app/chat.sendMessage/{matchId}"
  client.publish({
    destination: `/app/chat.sendMessage/${matchId}`,
    body: JSON.stringify({ content }),
  })
}
