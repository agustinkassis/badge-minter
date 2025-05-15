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
  event: NostrEvent
  badge: BadgeDefinition
  claim?: ClaimContent
}
