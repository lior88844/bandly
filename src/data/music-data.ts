export type InstrumentCategory =
  | 'String'
  | 'Woodwind'
  | 'Brass'
  | 'Percussion'
  | 'Keyboard'
  | 'Electronic'
  | 'Vocal'
  | 'Other'

export interface Instrument {
  name: string
  category: InstrumentCategory
}

export const INSTRUMENTS: Instrument[] = [
  // String Instruments
  { name: 'Acoustic Guitar', category: 'String' },
  { name: 'Electric Guitar', category: 'String' },
  { name: 'Bass Guitar', category: 'String' },
  { name: 'Violin', category: 'String' },
  { name: 'Viola', category: 'String' },
  { name: 'Cello', category: 'String' },
  { name: 'Double Bass', category: 'String' },
  { name: 'Ukulele', category: 'String' },
  { name: 'Banjo', category: 'String' },
  { name: 'Mandolin', category: 'String' },
  { name: 'Harp', category: 'String' },

  // Woodwind Instruments
  { name: 'Flute', category: 'Woodwind' },
  { name: 'Clarinet', category: 'Woodwind' },
  { name: 'Saxophone', category: 'Woodwind' },
  { name: 'Oboe', category: 'Woodwind' },
  { name: 'Bassoon', category: 'Woodwind' },
  { name: 'Recorder', category: 'Woodwind' },

  // Brass Instruments
  { name: 'Trumpet', category: 'Brass' },
  { name: 'Trombone', category: 'Brass' },
  { name: 'French Horn', category: 'Brass' },
  { name: 'Tuba', category: 'Brass' },
  { name: 'Euphonium', category: 'Brass' },

  // Percussion Instruments
  { name: 'Drums', category: 'Percussion' },
  { name: 'Percussion', category: 'Percussion' },
  { name: 'Djembe', category: 'Percussion' },
  { name: 'Cajon', category: 'Percussion' },
  { name: 'Xylophone', category: 'Percussion' },
  { name: 'Marimba', category: 'Percussion' },
  { name: 'Timpani', category: 'Percussion' },
  { name: 'Congas', category: 'Percussion' },
  { name: 'Bongos', category: 'Percussion' },

  // Keyboard Instruments
  { name: 'Piano', category: 'Keyboard' },
  { name: 'Synthesizer', category: 'Keyboard' },
  { name: 'Organ', category: 'Keyboard' },
  { name: 'Accordion', category: 'Keyboard' },
  { name: 'Digital Piano', category: 'Keyboard' },

  // Electronic Instruments
  { name: 'DJ/Turntables', category: 'Electronic' },
  { name: 'Electronic Production', category: 'Electronic' },
  { name: 'Drum Machine', category: 'Electronic' },
  { name: 'Sampler', category: 'Electronic' },

  // Vocal
  { name: 'Lead Vocals', category: 'Vocal' },
  { name: 'Backing Vocals', category: 'Vocal' },
  { name: 'Rap/MC', category: 'Vocal' },
  { name: 'Beatbox', category: 'Vocal' },

  // Other
  { name: 'Other', category: 'Other' },
]

export interface Genre {
  name: string
  subgenres: string[]
}

export const GENRES: Genre[] = [
  {
    name: 'Rock',
    subgenres: [
      'Alternative Rock',
      'Classic Rock',
      'Hard Rock',
      'Indie Rock',
      'Progressive Rock',
      'Punk Rock',
      'Metal',
      'Grunge',
    ],
  },
  {
    name: 'Jazz',
    subgenres: [
      'Bebop',
      'Swing',
      'Fusion',
      'Cool Jazz',
      'Free Jazz',
      'Latin Jazz',
      'Modern Jazz',
    ],
  },
  {
    name: 'Electronic',
    subgenres: [
      'House',
      'Techno',
      'EDM',
      'Ambient',
      'Drum & Bass',
      'Dubstep',
      'Trance',
      'IDM',
    ],
  },
  {
    name: 'Hip Hop',
    subgenres: [
      'Old School',
      'Trap',
      'Alternative Hip Hop',
      'Rap',
      'Underground',
      'R&B/Hip Hop',
    ],
  },
  {
    name: 'Pop',
    subgenres: [
      'Indie Pop',
      'Synth Pop',
      'Pop Rock',
      'Contemporary Pop',
      'Art Pop',
      'K-Pop',
    ],
  },
  {
    name: 'Folk',
    subgenres: [
      'Traditional Folk',
      'Contemporary Folk',
      'Folk Rock',
      'Americana',
      'Celtic',
      'Bluegrass',
    ],
  },
  {
    name: 'Classical',
    subgenres: [
      'Baroque',
      'Classical Period',
      'Romantic',
      'Contemporary Classical',
      'Opera',
      'Chamber Music',
    ],
  },
  {
    name: 'Blues',
    subgenres: [
      'Chicago Blues',
      'Delta Blues',
      'Electric Blues',
      'Jump Blues',
      'Blues Rock',
    ],
  },
  {
    name: 'World',
    subgenres: [
      'Latin',
      'African',
      'Asian',
      'Caribbean',
      'Middle Eastern',
      'Reggae',
    ],
  },
  {
    name: 'Funk & Soul',
    subgenres: ['Funk', 'Soul', 'R&B', 'Motown', 'Neo-Soul', 'Gospel'],
  },
]

// Helper functions
export const getAllInstrumentNames = () => INSTRUMENTS.map((i) => i.name)

export const getInstrumentsByCategory = (category: InstrumentCategory) =>
  INSTRUMENTS.filter((i) => i.category === category).map((i) => i.name)

export const getAllGenreNames = () =>
  GENRES.reduce<string[]>(
    (acc, genre) => [...acc, genre.name, ...genre.subgenres],
    []
  )

export const getSubgenres = (genreName: string) =>
  GENRES.find((g) => g.name === genreName)?.subgenres || []
