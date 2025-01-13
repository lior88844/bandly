import { useState, useRef, useEffect } from 'react'
import '../styles/components/Combobox.scss'

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  label?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  label,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (!isOpen) setSearch('')
  }, [isOpen])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !listboxRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) =>
          i >= filteredOptions.length - 1 ? 0 : i + 1
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) =>
          i <= 0 ? filteredOptions.length - 1 : i - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (isOpen && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className="combobox" style={{ border: '2px solid blue' }}>
      {label && <label className="combobox__label">{label}</label>}
      <div className="combobox__container">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
          }}
          placeholder={placeholder}
          style={{ position: 'relative', zIndex: 1 }}
        />
        <button
          type="button"
          className="combobox__toggle"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          tabIndex={-1}
        >
          ▼
        </button>
        {isOpen && (
          <ul
            ref={listboxRef}
            className="combobox__options"
            role="listbox"
            id="options-listbox"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredOptions.length === 0 ? (
              <li className="combobox__empty">No options found</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`combobox__option ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
