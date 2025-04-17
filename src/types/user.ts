import { getAllInstrumentNames, getAllGenreNames } from '../data/music-data'

export type InstrumentName = ReturnType<typeof getAllInstrumentNames>[number]
export type GenreName = ReturnType<typeof getAllGenreNames>[number]

export interface UserProfile {
  id: string
  username: string
  email: string
  location?: string
  coordinates?: {
    lat: number
    lng: number
  }
  instrument?: string
  experience?: string
  genres?: string[]
  createdAt: string
}

export type ExperienceLevel =
  | 'Beginner (0-2 years)'
  | 'Intermediate (2-5 years)'
  | 'Advanced (5-10 years)'
  | 'Professional (10+ years)'

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Beginner (0-2 years)',
  'Intermediate (2-5 years)',
  'Advanced (5-10 years)',
  'Professional (10+ years)',
]

export const INSTRUMENTS = [
  'Guitar',
  'Bass',
  'Drums',
  'Vocals',
  'Piano/Keyboard',
  'Saxophone',
  'Trumpet',
  'Violin',
  'Other',
] as const

export const GENRES = [
  'Rock',
  'Jazz',
  'Blues',
  'Classical',
  'Pop',
  'Metal',
  'Folk',
  'Electronic',
  'R&B',
  'Hip Hop',
  'Country',
  'Indie',
  'Alternative',
  'Punk',
  'Funk',
  'Soul',
] as const
