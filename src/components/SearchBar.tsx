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
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
}

const allInstruments = INSTRUMENTS.map((i) => i.name)
const allGenres = getAllGenreNames()

export function SearchBar({ onSearch }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    instrument: '',
    location: '',
    genre: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
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

        <LocationAutocomplete
          value={filters.location}
          onChange={(value) => updateFilters({ location: value })}
        />

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
