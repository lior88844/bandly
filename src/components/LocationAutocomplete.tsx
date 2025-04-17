import { useEffect, useRef, useState } from 'react'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'
import '../styles/components/LocationAutocomplete.scss'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export function LocationAutocomplete({
  value,
  onChange,
  required,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [error, setError] = useState(false)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  useEffect(() => {
    if (loadError) {
      console.error('Failed to load Google Maps API')
      setError(true)
    }
  }, [loadError])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || error) return

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'],
          fields: ['formatted_address', 'geometry'],
        }
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.formatted_address) {
          onChange(place.formatted_address)
        }
      })
    } catch (err) {
      console.error('Error initializing autocomplete:', err)
      setError(true)
    }
  }, [isLoaded, onChange, error])

  return (
    <div className="location-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoaded ? 'Start typing a city...' : 'Loading...'}
        required={required}
        disabled={!isLoaded}
        className="location-input"
      />
      {!isLoaded && !error && (
        <div className="location-autocomplete__loading">Loading...</div>
      )}
      {error && (
        <div className="location-autocomplete__error">
          Location service unavailable
        </div>
      )}
    </div>
  )
}
