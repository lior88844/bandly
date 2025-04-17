import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getFirebaseErrorMessage } from '../utils/firebaseErrors'
import { getCoordinatesFromLocation } from '../utils/geocoding'
import {
  EXPERIENCE_LEVELS,
  GENRES,
  INSTRUMENTS,
  type UserProfile,
} from '../types/user'
import '../styles/pages/Auth.scss'
import { LocationAutocomplete } from '../components/LocationAutocomplete'

type SignUpStep = 'credentials' | 'profile' | 'preferences'

interface SignUpFormData extends Partial<UserProfile> {
  password?: string
}

export function SignUp() {
  const [step, setStep] = useState<SignUpStep>('credentials')
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    username: '',
    location: '',
    instrument: '',
    experience: '',
    genres: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const updateForm = (fields: Partial<SignUpFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const handleNext = () => {
    if (step === 'credentials') setStep('profile')
    else if (step === 'profile') setStep('preferences')
  }

  const handleBack = () => {
    if (step === 'preferences') setStep('profile')
    else if (step === 'profile') setStep('credentials')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (
        !formData.email ||
        !formData.password ||
        !formData.username ||
        !formData.instrument ||
        !formData.experience
      ) {
        throw new Error('Please fill in all required fields')
      }

      const coordinates = formData.location
        ? await getCoordinatesFromLocation(formData.location)
        : null

      const userData = {
        id: '', // Will be set by Firebase
        username: formData.username,
        email: formData.email,
        location: formData.location || undefined,
        coordinates: coordinates || undefined,
        instrument: formData.instrument,
        experience: formData.experience,
        genres: formData.genres ?? [],
        createdAt: new Date().toISOString(),
      }

      const { user } = await signUp(formData.email, formData.password)
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        id: user.uid,
      })

      navigate('/search')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create an account'
      )
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h1>Create Account</h1>
        <div className="auth-form__steps">
          <div className={`step ${step === 'credentials' ? 'active' : ''}`}>
            1
          </div>
          <div className={`step ${step === 'profile' ? 'active' : ''}`}>2</div>
          <div className={`step ${step === 'preferences' ? 'active' : ''}`}>
            3
          </div>
        </div>
        {error && <div className="form__error">{error}</div>}
        <form className="form" onSubmit={handleSubmit}>
          {step === 'credentials' && (
            <>
              <div className="form__group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => updateForm({ username: e.target.value })}
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => updateForm({ password: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {step === 'profile' && (
            <>
              <div className="form__group">
                <label htmlFor="location">Location</label>
                <LocationAutocomplete
                  value={formData.location ?? ''}
                  onChange={(value) => updateForm({ location: value })}
                  required
                />
              </div>
              <div className="form__group">
                <label htmlFor="instrument">Main Instrument</label>
                <select
                  id="instrument"
                  value={formData.instrument}
                  onChange={(e) => updateForm({ instrument: e.target.value })}
                  required
                >
                  <option value="">Select an instrument</option>
                  {INSTRUMENTS.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form__group">
                <label htmlFor="experience">Experience Level</label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => updateForm({ experience: e.target.value })}
                  required
                >
                  <option value="">Select experience level</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 'preferences' && (
            <div className="form__group">
              <label>Preferred Genres</label>
              <div className="genres-grid">
                {GENRES.map((genre) => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.genres?.includes(genre)}
                      onChange={(e) => {
                        const genres = e.target.checked
                          ? [...(formData.genres || []), genre]
                          : formData.genres?.filter((g) => g !== genre)
                        updateForm({ genres })
                      }}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form__actions">
            {step !== 'credentials' && (
              <button
                type="button"
                onClick={handleBack}
                className="button"
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="button button--primary"
              disabled={loading}
            >
              {loading
                ? 'Creating Account...'
                : step === 'preferences'
                ? 'Create Account'
                : 'Next'}
            </button>
          </div>
        </form>

        {step === 'credentials' && (
          <p className="auth-form__footer">
            Already have an account? <a href="/login">Log In</a>
          </p>
        )}
      </div>
    </div>
  )
}
