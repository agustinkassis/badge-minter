'use client'

import { BadgeDefinition } from '@/types/badge'
import { useSubscription } from 'nostr-hooks'
import { BadgeDefinition as BadgeDefinitionKind } from 'nostr-tools/kinds'
import { naddrEncode } from 'nostr-tools/nip19'
import { useEffect, useState } from 'react'

interface UseBadgesDefinitionsProps {
  pubkey: string
}

interface UseBadgesDefinitionsReturn {
  badges: BadgeDefinition[]
  isLoading: boolean
}

export const useBadgesDefinitions = ({
  pubkey
}: UseBadgesDefinitionsProps): UseBadgesDefinitionsReturn => {
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
          const identifier = event.tagValue('d')!
          const naddr = naddrEncode({
            identifier,
            pubkey: event.pubkey,
            kind: BadgeDefinitionKind
          })
          return {
            id: identifier,
            name: event.tagValue('name') || 'No name',
            description: event.tagValue('description') || 'No description',
            image: event.tagValue('image') || 'No image',
            pubkey: event.pubkey,
            naddr: naddr
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
