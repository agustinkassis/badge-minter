import { BadgeAward } from '@/types/badge'

export const mockBadge = {
  id: 'mock',
  name: 'Mock Badge',
  description: 'A mock badge for testing',
  image: '/placeholder.svg',
  pubkey: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
  naddr: 'naddr1mock'
}

// Mock user profiles for simulation
export const mockUsers: BadgeAward[] = [
  {
    id: '1',
    claim: {
      displayName: 'Sarah Johnson',
      image: '/colorful-profile-avatar.png',
      pubkey:
        'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      nip05: 'sarahjohnson@example.com'
    },
    pubkey: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    event: {
      id: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      pubkey:
        'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      created_at: 1715808000,
      kind: 1,
      content: 'Hello, world!',
      tags: [],
      sig: ''
    },
    badge: mockBadge
  }
]

export function generateRandomBadgeAward() {
  // Generate random ID
  const id = Math.random().toString(36).substring(2, 15)

  // Random display name components
  const firstNames = [
    'Alex',
    'Jordan',
    'Taylor',
    'Morgan',
    'Casey',
    'Riley',
    'Quinn',
    'Avery'
  ]
  const lastNames = [
    'Smith',
    'Jones',
    'Williams',
    'Brown',
    'Davis',
    'Miller',
    'Wilson',
    'Moore'
  ]

  // Generate random name
  const displayName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`

  // Generate random pubkey
  const pubkey = `npub1${Math.random().toString(36).substring(2, 62)}`

  // Generate random event ID
  const eventId = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')

  return {
    id,
    claim: {
      displayName,
      image: '/colorful-profile-avatar.png',
      pubkey,
      nip05: `${displayName.toLowerCase().replace(' ', '.')}@example.com`
    },
    pubkey,
    event: {
      id: eventId,
      pubkey,
      created_at: Date.now() / 1000,
      kind: 1,
      content: 'Claimed badge',
      tags: [],
      sig: ''
    },
    badge: mockBadge
  }
}
