import { useState } from 'react'
import { LocationAutocomplete } from './LocationAutocomplete'
import { Combobox } from './Combobox'
import { INSTRUMENTS, getAllGenreNames } from '../data/music-data'
import '../styles/components/SearchBar.scss'

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

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
}

const allInstruments = INSTRUMENTS.map((instrument) => instrument.toString())
const allGenres = getAllGenreNames()
const distanceOptions = [1, 2, 5, 10, 20, 30, 50, 100]

export function SearchBar({ onSearch }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    instrument: '',
    location: '',
    genre: '',
    distance: 10,
    useCurrentLocation: false,
  })
  const [gettingLocation, setGettingLocation] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFilters({
          useCurrentLocation: true,
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        })
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert(
          'Unable to get your location. Please try again or enter a location manually.'
        )
        setGettingLocation(false)
      }
    )
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar__main">
        <input
          type="text"
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          placeholder="Search for musicians..."
          className="search-bar__input"
        />
        <button type="submit" className="button button--primary">
          Search
        </button>
      </div>
      <div className="search-bar__filters">
        <Combobox
          value={filters.instrument}
          onChange={(value) => updateFilters({ instrument: value })}
          options={allInstruments}
          placeholder="Select an instrument"
          label="Instrument"
        />

        <div className="location-filter">
          <LocationAutocomplete
            value={filters.location}
            onChange={(value) =>
              updateFilters({
                location: value,
                useCurrentLocation: false,
                coordinates: undefined,
              })
            }
          />
          <button
            type="button"
            className="button button--secondary"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
          >
            {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </button>
        </div>

        <div className="distance-filter">
          <label>Distance (km)</label>
          <select
            value={filters.distance}
            onChange={(e) =>
              updateFilters({ distance: Number(e.target.value) })
            }
            className="search-bar__select"
          >
            {distanceOptions.map((distance) => (
              <option key={distance} value={distance}>
                {distance} km
              </option>
            ))}
          </select>
        </div>

        <Combobox
          value={filters.genre}
          onChange={(value) => updateFilters({ genre: value })}
          options={allGenres}
          placeholder="Select a genre"
          label="Genre"
        />
      </div>
    </form>
  )
}
