'use client'

import { BadgeDefinition } from '@/types/badge'
import { useSubscription } from 'nostr-hooks'
import { BadgeDefinition as BadgeDefinitionKind } from 'nostr-tools/kinds'
import { useEffect, useState } from 'react'

interface UseBadgesDefinitionsProps {
  pubkey: string
}

interface UseBadgeDefinitionsReturn {
  badges: BadgeDefinition[]
  isLoading: boolean
}

const mockBadges = [
  {
    id: 'Nos-Vegas-13',
    name: 'Nos Vegas 1/3',
    description: 'Nos Vegas 1/3',
    image: 'https://m.primal.net/PiYj.jpg',
    pubkey: '115d4980bffffd015d048490a9813ad4f0de535aa3943821170277cfa5562ebe'
  }
]

export const useBadgeDefinitions = ({
  pubkey
}: UseBadgesDefinitionsProps): UseBadgeDefinitionsReturn => {
  const [badges, setBadges] = useState<BadgeDefinition[]>([])

  const { events, isLoading, eose, createSubscription, removeSubscription } =
    useSubscription('badges-definitions')

  useEffect(() => {
    if (!pubkey) return

    createSubscription({
      filters: [{ authors: [pubkey], kinds: [BadgeDefinitionKind] }]
    })
  }, [pubkey, createSubscription])

  useEffect(() => {
    if (events) {
      setBadges(
        events.map(event => {
          return {
            id: event.tagValue('d')!,
            name: event.tagValue('name') || 'No name',
            description: event.tagValue('description') || 'No description',
            image: event.tagValue('image') || 'No image',
            pubkey: event.pubkey
          } as BadgeDefinition
        })
      )
    }

    if (eose) {
      removeSubscription()
    }
  }, [events, eose])

  return { badges, isLoading }
}
