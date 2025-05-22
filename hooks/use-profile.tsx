import { NostrFilter } from '@nostrify/nostrify'
import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from './use-subscription'

export interface NostrProfile {
  name?: string
  display_name?: string
  displayName?: string
  picture?: string
  nip05?: string
  about?: string
  banner?: string
  website?: string
  lud16?: string
  lud06?: string
  [key: string]: any
  lastUpdated?: number
}

export function useProfile(pubkey: string) {
  const [profile, setProfile] = useState<NostrProfile | null>()
  const filters: NostrFilter = useMemo(
    () => ({ kinds: [0], authors: [pubkey] }),
    [pubkey]
  )
  const { events } = useSubscription({
    filter: filters
  })

  useEffect(() => {
    if (!events || events.length === 0) return
    console.info('events', events)
    setProfile(currentProfile => {
      if ((currentProfile?.lastUpdated || 0) > events[0].created_at) {
        return currentProfile
      } else {
        return JSON.parse(events[0].content)
      }
    })
  }, [events])
  return { profile }
}
