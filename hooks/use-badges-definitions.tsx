'use client'

import { BadgeDefinition } from '@/types/badge'
import { BadgeDefinition as BadgeDefinitionKind } from 'nostr-tools/kinds'
import { naddrEncode } from 'nostr-tools/nip19'
import { useEffect, useState } from 'react'
import { useNostr } from '@nostrify/react'

interface UseBadgesDefinitionsProps {
  pubkey: string
}

interface UseBadgesDefinitionsReturn {
  badges: BadgeDefinition[]
  isLoading: boolean
}

// Helper to extract tag value from event.tags
function getTagValue(event: any, tagName: string): string | undefined {
  const tag = event.tags?.find((t: string[]) => t[0] === tagName)
  return tag ? tag[1] : undefined
}

export const useBadgesDefinitions = ({
  pubkey
}: UseBadgesDefinitionsProps): UseBadgesDefinitionsReturn => {
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { nostr } = useNostr()

  useEffect(() => {
    if (!pubkey || !nostr) return
    setIsLoading(true)
    nostr
      .query([{ authors: [pubkey], kinds: [BadgeDefinitionKind] }])
      .then(events => {
        setBadges(
          events.map(event => {
            const identifier = getTagValue(event, 'd')!
            const naddr = naddrEncode({
              identifier,
              pubkey: event.pubkey,
              kind: BadgeDefinitionKind
            })
            return {
              id: identifier,
              name: getTagValue(event, 'name') || 'No name',
              description:
                getTagValue(event, 'description') || 'No description',
              image: getTagValue(event, 'image') || 'No image',
              pubkey: event.pubkey,
              naddr: naddr
            } as BadgeDefinition
          })
        )
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [pubkey, nostr])

  return { badges, isLoading }
}
