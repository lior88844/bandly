import { useEffect, useRef, useState } from 'react'
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
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => setLoaded(true)
    script.onerror = () => {
      setError(true)
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!loaded || !inputRef.current || error) return

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
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
  }, [loaded, onChange, error])

  // Fallback to simple input if there's an error
  if (error) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your city"
        required={required}
        className="location-input"
      />
    )
  }

  return (
    <div className="location-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={loaded ? 'Start typing a city...' : 'Loading...'}
        required={required}
        disabled={!loaded}
      />
      {!loaded && (
        <div className="location-autocomplete__loading">Loading...</div>
      )}
    </div>
  )
}
