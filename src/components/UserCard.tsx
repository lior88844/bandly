import { useState } from 'react'
import { UserProfile } from '../types/user'
import { UserProfileModal } from './UserProfileModal'
import '../styles/components/UserCard.scss'

interface UserCardProps {
  user: UserProfile
}

export function UserCard({ user }: UserCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        className="user-card"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="user-card__header">
          <h3>{user.username}</h3>
          {user.instrument && (
            <span className="user-card__instrument">{user.instrument}</span>
          )}
        </div>
        <div className="user-card__info">
          {user.location && (
            <p className="user-card__location">{user.location}</p>
          )}
          {user.experience && (
            <p className="user-card__experience">{user.experience}</p>
          )}
        </div>
        {user.genres && user.genres.length > 0 && (
          <div className="user-card__genres">
            {user.genres.map((genre) => (
              <span key={genre} className="user-card__genre">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <UserProfileModal
          user={user}
          onClose={() => {
            console.log('Closing modal')
            setIsModalOpen(false)
          }}
        />
      )}
    </>
  )
}
