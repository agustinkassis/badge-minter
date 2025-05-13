import { BadgeDefinition } from '@/types/badge'
import { useSubscription } from 'nostr-hooks'
import { AddressPointer, decode, NAddr } from 'nostr-tools/nip19'
import { useEffect, useState } from 'react'
export interface UseBadgeProps {
  naddr?: string
}

export interface UseBadgeReturn {
  badge: BadgeDefinition | null
  isLoading: boolean
}

export const useBadge = ({ naddr }: UseBadgeProps = {}): UseBadgeReturn => {
  const [badge, setBadge] = useState<BadgeDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { events, eose, createSubscription, removeSubscription } =
    useSubscription('fetch-single-badge-definition')

  // Set loading state when naddr is provided
  useEffect(() => {
    if (!naddr) return
    setIsLoading(true)
  }, [naddr])

  // Create subscription when naddr is provided
  useEffect(() => {
    if (!naddr) return

    const {
      data: { identifier, kind, pubkey }
    } = decode(naddr) as unknown as {
      type: 'nevent'
      data: AddressPointer
    }

    createSubscription({
      filters: [{ authors: [pubkey], kinds: [kind], '#d': [identifier] }]
    })
  }, [createSubscription])

  // Set loading state to false when eose is true and no events are returned
  useEffect(() => {
    if (eose && events?.length === 0) {
      setIsLoading(false)
      return
    }

    if (!events?.length || !naddr) {
      return
    }
    const event = events[0]
    const identifier = event.tagValue('d')!
    setBadge({
      id: identifier,
      name: event.tagValue('name') || 'No name',
      description: event.tagValue('description') || 'No description',
      image: event.tagValue('image') || 'No image',
      pubkey: event.pubkey,
      naddr: naddr
    })

    setIsLoading(false)
    removeSubscription()
  }, [events, eose, naddr])

  return {
    badge,
    isLoading
  }
}
