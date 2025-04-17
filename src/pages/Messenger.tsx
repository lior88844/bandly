import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Chat } from '../components/Chat'
import '../styles/pages/Messenger.scss'

interface Conversation {
  id: string
  participants: string[]
  lastMessage: {
    text: string
    timestamp: Date
    senderId: string
  }
  participantInfo: {
    [key: string]: {
      username: string
      instrument?: string
    }
  }
}

export function Messenger() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Listen for conversations where the current user is a participant
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessage.timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversationsData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            lastMessage: {
              ...data.lastMessage,
              timestamp: data.lastMessage?.timestamp?.toDate() || new Date(),
            },
          }
        }) as Conversation[]

        setConversations(conversationsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching conversations:', error)
        setLoading(false)
        // If the error is about missing index, show a more user-friendly message
        if (
          error.code === 'failed-precondition' &&
          error.message.includes('index')
        ) {
          setError('Setting up the database. This may take a few minutes...')
        } else {
          setError('Error loading conversations. Please try again later.')
        }
      }
    )

    return () => unsubscribe()
  }, [user])

  const getRecipientInfo = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(
      (id) => id !== user?.uid
    )
    return otherParticipantId
      ? conversation.participantInfo[otherParticipantId]
      : undefined
  }

  return (
    <div className="messenger">
      <div className="messenger__sidebar">
        <h2>Messages</h2>
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="empty">No conversations yet</div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => {
              const otherParticipantId = conversation.participants.find(
                (id) => id !== user?.uid
              )!
              const otherParticipant =
                conversation.participantInfo[otherParticipantId]

              return (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    selectedChat === conversation.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedChat(conversation.id)}
                >
                  <div className="conversation-item__info">
                    <h3>{otherParticipant.username}</h3>
                    {otherParticipant.instrument && (
                      <span className="instrument">
                        {otherParticipant.instrument}
                      </span>
                    )}
                  </div>
                  <div className="conversation-item__last-message">
                    <p>
                      {conversation.lastMessage.senderId === user?.uid
                        ? 'You: '
                        : ''}
                      {conversation.lastMessage.text}
                    </p>
                    <span className="timestamp">
                      {conversation.lastMessage.timestamp?.toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      ) || 'No time'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="messenger__main">
        {selectedChat ? (
          <Chat
            conversationId={selectedChat}
            recipient={
              conversations.find((c) => c.id === selectedChat)
                ? getRecipientInfo(
                    conversations.find((c) => c.id === selectedChat)!
                  )
                : undefined
            }
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
