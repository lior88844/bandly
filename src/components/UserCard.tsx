import { UserProfile } from '../types/user'
import '../styles/components/UserCard.scss'

interface UserCardProps {
  user: UserProfile
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
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
  )
}
