import { useNostr } from '@nostrify/react'
import { useEffect, useState } from 'react'

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
}

export function useProfile(pubkey: string) {
  const { nostr } = useNostr()
  const [profile, setProfile] = useState<NostrProfile | null>()
  useEffect(() => {
    if (!pubkey || pubkey === '' || !nostr) return
    nostr.query([{ kinds: [0], authors: [pubkey] }]).then(events => {
      if (events && events.length > 0) {
        try {
          setProfile(JSON.parse(events[0].content))
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })
  }, [pubkey, nostr])
  return { profile }
}
