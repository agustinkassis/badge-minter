import { useCallback, useState } from 'react'
import { NostrEvent } from '@nostrify/nostrify'
import { EventTemplate } from 'nostr-tools'
import {
  BadgeAward as NostrBadgeAwardKind,
  BadgeDefinition as NostrBadgeDefinitionKind
} from 'nostr-tools/kinds'

import { useNostrAdmin } from '@/contexts/nostr-admin-context'

import { BadgeAward, BadgeDefinition } from '@/types/badge'
import { ClaimContent } from '@/types/claim'
import { getTagValue } from '@/lib/nostr'

export interface UseBadgesProps {
  badge?: BadgeDefinition | null // If provided, it starts listening for badge awards
}

export interface UseBadgesReturn {
  award: (
    pubkey: string,
    badge?: BadgeDefinition,
    claim?: ClaimContent
  ) => Promise<BadgeAward>
  awards: BadgeAward[]
}

export const useBadges = ({ badge }: UseBadgesProps): UseBadgesReturn => {
  const { signer } = useNostrAdmin()
  const [awards, setAwards] = useState<BadgeAward[]>([])
  //   const { nostr } = useNostr()

  const award = useCallback(
    async (
      pubkey: string,
      _badge?: BadgeDefinition,
      claim?: ClaimContent
    ): Promise<BadgeAward> => {
      const awardBadge = badge || _badge

      if (!awardBadge) {
        throw new Error('No badge to award. Please provide a badge definition.')
      }

      if (awardBadge.pubkey !== (await signer?.getPublicKey())) {
        throw new Error('You are not authorized to award badges')
      }

      const unsignedEvent = {
        created_at: Math.floor(new Date().getTime() / 1000),
        kind: NostrBadgeAwardKind,
        tags: [
          [
            'a',
            `${NostrBadgeDefinitionKind}:${awardBadge.pubkey}:${awardBadge.id}`
          ],
          ['p', pubkey]
        ],
        content: ''
      } as EventTemplate

      const event = await signer?.signEvent(unsignedEvent)!
      const award = await generateAward(event, awardBadge, claim)

      console.info('Award:', award)

      setAwards(prev => [...prev, award])

      // Publish the event
      //   nostr.event(event)

      return award
    },
    [signer, badge]
  )

  return { award, awards }
}

async function generateAward(
  event: NostrEvent,
  badge: BadgeDefinition,
  claim?: ClaimContent
): Promise<BadgeAward> {
  return {
    id: event.id,
    pubkey: getTagValue(event, 'p')!,
    event,
    badge,
    claim
  }
}
