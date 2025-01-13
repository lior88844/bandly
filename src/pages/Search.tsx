import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { SearchBar } from '../components/SearchBar'
import { UserCard } from '../components/UserCard'
import { UserProfile } from '../types/user'
import '../styles/pages/Search.scss'

interface SearchFilters {
  query: string
  instrument: string
  location: string
  genre: string
}

export function Search() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async (filters?: SearchFilters) => {
    try {
      setLoading(true)
      const constraints: QueryConstraint[] = []

      if (filters) {
        if (filters.instrument) {
          constraints.push(where('instrument', '==', filters.instrument))
        }
        if (filters.genre) {
          constraints.push(where('genres', 'array-contains', filters.genre))
        }
        // Location is handled client-side due to Firestore limitations
      }

      const usersRef = collection(db, 'users')
      const q =
        constraints.length > 0 ? query(usersRef, ...constraints) : usersRef
      const querySnapshot = await getDocs(q)

      let usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        username: '',
        email: '',
        location: '',
        instrument: '',
        experience: '',
        genres: [],
        createdAt: '',
        ...(doc.data() as UserProfile),
      }))

      // Client-side filtering
      if (filters) {
        // Filter by location if specified
        if (filters.location) {
          usersData = usersData.filter((user) =>
            user.location
              ?.toLowerCase()
              .includes(filters.location.toLowerCase())
          )
        }

        // Filter by search query
        if (filters.query) {
          const searchLower = filters.query.toLowerCase()
          usersData = usersData.filter(
            (user) =>
              user.username.toLowerCase().includes(searchLower) ||
              user.instrument?.toLowerCase().includes(searchLower) ||
              user.genres?.some((genre) =>
                genre.toLowerCase().includes(searchLower)
              )
          )
        }
      }

      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = async (filters: SearchFilters) => {
    await fetchUsers(filters)
  }

  return (
    <div className="search-page">
      <h1>Find Musicians</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="search-results">
        {loading ? (
          <div className="loading">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : users.length === 0 ? (
          <div className="no-results">
            <p>No musicians found</p>
            <p className="no-results__subtitle">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
