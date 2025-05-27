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
