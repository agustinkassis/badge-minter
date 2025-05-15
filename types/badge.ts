import { NostrEvent } from '@nostrify/nostrify'
import { ClaimContent } from './claim'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  image: string
  pubkey: string
  naddr: string
}

export interface BadgeAward {
  id: string
  pubkey: string
  badge: BadgeDefinition
  event: NostrEvent // Kind 8 event published by admin
  claim?: ClaimContent // Claim content
}
