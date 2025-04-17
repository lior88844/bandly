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
import { useAuth } from '../contexts/AuthContext'
import {
  calculateDistance,
  getCoordinatesFromLocation,
} from '../utils/geocoding'
import { mockUsers } from '../data/mockData'

interface SearchFilters {
  query: string
  instrument: string
  location: string
  genre: string
  distance: number
  useCurrentLocation: boolean
  coordinates?: {
    lat: number
    lng: number
  }
}

export function Search() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [useMockData, setUseMockData] = useState(false)

  const fetchUsers = async (filters?: SearchFilters) => {
    try {
      setLoading(true)

      // Try to fetch from Firebase first
      try {
        const constraints: QueryConstraint[] = []

        if (filters) {
          if (filters.instrument) {
            constraints.push(where('instrument', '==', filters.instrument))
          }
          if (filters.genre) {
            constraints.push(where('genres', 'array-contains', filters.genre))
          }
        }

        const usersRef = collection(db, 'users')
        const q =
          constraints.length > 0 ? query(usersRef, ...constraints) : usersRef
        const querySnapshot = await getDocs(q)

        let usersData = querySnapshot.docs
          .filter((doc) => doc.id !== user?.uid)
          .map((doc) => ({
            ...(doc.data() as UserProfile),
            id: doc.id,
          }))

        // Client-side filtering
        if (filters) {
          // Get coordinates for location-based filtering if needed
          let searchCoordinates = filters.coordinates
          if (filters.location && !filters.useCurrentLocation) {
            const coords = await getCoordinatesFromLocation(filters.location)
            if (coords) {
              searchCoordinates = coords
            }
          }

          // Filter by distance if coordinates are available
          if (searchCoordinates) {
            usersData = usersData.filter((user) => {
              if (!user.coordinates) return false
              const distance = calculateDistance(
                searchCoordinates!.lat,
                searchCoordinates!.lng,
                user.coordinates.lat,
                user.coordinates.lng
              )
              return distance <= filters.distance
            })
          }
          // If no coordinates but location is specified, fall back to text-based filtering
          else if (filters.location) {
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
        setUseMockData(false)
      } catch (firebaseError) {
        console.error(
          'Firebase error, falling back to mock data:',
          firebaseError
        )
        setUseMockData(true)

        // Use mock data with the same filtering logic
        let usersData = [...mockUsers]

        if (filters) {
          // Filter by instrument
          if (filters.instrument) {
            usersData = usersData.filter(
              (user) =>
                user.instrument?.toLowerCase() ===
                filters.instrument.toLowerCase()
            )
          }

          // Filter by genre
          if (filters.genre) {
            usersData = usersData.filter((user) =>
              user.genres?.some(
                (genre) => genre.toLowerCase() === filters.genre.toLowerCase()
              )
            )
          }

          // Filter by location and distance
          if (filters.location || filters.useCurrentLocation) {
            let searchCoordinates = filters.coordinates
            if (filters.location && !filters.useCurrentLocation) {
              const coords = await getCoordinatesFromLocation(filters.location)
              if (coords) {
                searchCoordinates = coords
              }
            }

            if (searchCoordinates) {
              usersData = usersData.filter((user) => {
                if (!user.coordinates) return false
                const distance = calculateDistance(
                  searchCoordinates!.lat,
                  searchCoordinates!.lng,
                  user.coordinates.lat,
                  user.coordinates.lng
                )
                return distance <= filters.distance
              })
            } else if (filters.location) {
              usersData = usersData.filter((user) =>
                user.location
                  ?.toLowerCase()
                  .includes(filters.location.toLowerCase())
              )
            }
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
      }
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
  }, [user])

  const handleSearch = async (filters: SearchFilters) => {
    await fetchUsers(filters)
  }

  return (
    <div className="search-page">
      <h1>Find Musicians</h1>
      {useMockData && (
        <div className="mock-data-warning">
          Using mock data - Firebase connection unavailable
        </div>
      )}
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
