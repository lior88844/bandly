import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserProfile } from '../types/user'
import { Chat } from './Chat'
import { getOrCreateConversation } from '../utils/chat'
import '../styles/components/UserProfileModal.scss'

interface UserProfileModalProps {
  user: UserProfile
  onClose: () => void
}

export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  const { user: currentUser, userData } = useAuth()
  const [showChat, setShowChat] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartChat = async () => {
    if (!currentUser || !userData) {
      setError('You must be logged in to start a chat')
      return
    }

    setLoading(true)
    try {
      // Create a complete user profile with Firebase Auth UID
      const currentUserProfile: UserProfile = {
        ...userData,
        id: currentUser.uid,
      }

      const chatId = await getOrCreateConversation(currentUserProfile, user)
      setConversationId(chatId)
      setShowChat(true)
      setError(null)
    } catch (error) {
      console.error('Error starting chat:', error)
      setError(error instanceof Error ? error.message : 'Failed to start chat')
    } finally {
      setLoading(false)
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          ×
        </button>

        <div className="modal__content">
          {showChat && conversationId ? (
            <Chat
              conversationId={conversationId}
              recipient={{
                username: user.username,
                instrument: user.instrument,
              }}
            />
          ) : (
            <div className="user-profile">
              <div className="user-profile__header">
                <h2>{user.username}</h2>
                <span className="user-profile__instrument">
                  {user.instrument}
                </span>
              </div>

              <div className="user-profile__info">
                <div className="info-group">
                  <label>Location</label>
                  <p>{user.location || 'Not specified'}</p>
                </div>

                <div className="info-group">
                  <label>Experience</label>
                  <p>{user.experience || 'Not specified'}</p>
                </div>

                <div className="info-group">
                  <label>Genres</label>
                  <div className="user-profile__genres">
                    {user.genres?.map((genre) => (
                      <span key={genre} className="genre-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {currentUser?.uid !== user.id && (
                <div className="user-profile__actions">
                  {error && <div className="error-message">{error}</div>}
                  <button
                    className="button button--primary"
                    onClick={handleStartChat}
                    disabled={loading}
                  >
                    {loading ? 'Starting chat...' : 'Start Chat'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
