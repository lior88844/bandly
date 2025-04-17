import { useState, useEffect, useRef } from 'react'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/components/Chat.scss'

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  senderName: string
}

interface ChatProps {
  conversationId: string
  recipient?: {
    username: string
    instrument?: string
  }
}

const MESSAGES_PER_PAGE = 20

export function Chat({ conversationId, recipient }: ChatProps) {
  const { user, userData } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastMessageRef = useRef<Message | null>(null)

  if (!recipient) {
    return (
      <div className="chat">
        <div className="chat__header">
          <h3>Loading chat...</h3>
        </div>
        <div className="chat__messages">
          <div className="chat__loading">Loading conversation details...</div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!user) return

    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    )
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_PER_PAGE)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        }
      }) as Message[]

      setMessages(newMessages.reverse())
      setLoading(false)

      // Set initial scroll position to bottom without animation
      const messagesContainer = document.querySelector('.chat__messages')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }

      // Store the last message for pagination
      if (newMessages.length > 0) {
        lastMessageRef.current = newMessages[0]
      }
    })

    return () => unsubscribe()
  }, [user, conversationId])

  const loadMoreMessages = async () => {
    if (!lastMessageRef.current || !hasMore || loadingMore) return

    setLoadingMore(true)
    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    )
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(lastMessageRef.current.timestamp),
      limit(MESSAGES_PER_PAGE)
    )

    try {
      const snapshot = await getDocs(q)
      const olderMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as Message[]

      if (olderMessages.length < MESSAGES_PER_PAGE) {
        setHasMore(false)
      }

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages.reverse(), ...prev])
        lastMessageRef.current = olderMessages[0]
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    if (scrollTop === 0 && hasMore) {
      loadMoreMessages()
    }
  }

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.chat__messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Only scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, loading])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim() || !userData) return

    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    )
    const conversationRef = doc(db, 'conversations', conversationId)

    try {
      const timestamp = serverTimestamp()
      const messageData = {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: userData.username,
        timestamp,
      }

      // Add message to messages subcollection
      await addDoc(messagesRef, messageData)

      setNewMessage('')

      // Update last message in conversation document
      await setDoc(
        conversationRef,
        {
          lastMessage: {
            ...messageData,
            timestamp,
          },
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="chat">
      <div className="chat__header">
        <h3>Chat with {recipient.username}</h3>
      </div>

      <div className="chat__messages" onScroll={handleScroll}>
        {loadingMore && (
          <div className="chat__loading">Loading more messages...</div>
        )}
        {loading ? (
          <div className="chat__loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat__empty">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat__message ${
                  message.senderId === user?.uid ? 'sent' : 'received'
                }`}
              >
                <div className="message-content">
                  <span className="sender">{message.senderName}</span>
                  <p>{message.text}</p>
                  <span className="timestamp">
                    {message.timestamp?.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    }) || 'No timestamp'}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <form className="chat__input" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="button button--primary">
          Send
        </button>
      </form>
    </div>
  )
}
