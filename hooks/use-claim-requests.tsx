import { useEffect, useRef } from 'react'
import { useNostr } from '@nostrify/react'
import { NostrEvent, NostrFilter } from '@nostrify/nostrify'
import { BadgeDefinition } from '@/types/badge'

export interface UseClaimRequestsProps {
  since?: number
  until?: number
  badge?: BadgeDefinition
  onClaimRequest: (event: NostrEvent) => void
}

export function useClaimRequests({
  since = 0,
  until = Infinity,
  badge,
  onClaimRequest
}: UseClaimRequestsProps) {
  const { nostr } = useNostr()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!nostr || !badge) return

    console.info('Starting claim requests subscription')

    const controller = new AbortController()
    abortRef.current = controller

    const filter: NostrFilter = {
      kinds: [25666],
      '#p': [badge.pubkey],
      '#a': [`30009:${badge.pubkey}:${badge.id}`],
      since,
      until
    }

    console.info('Filter', filter)
    ;(async () => {
      try {
        for await (const msg of nostr.req([filter], {
          signal: controller.signal
        })) {
          if (msg[0] === 'EVENT') {
            onClaimRequest(msg[2])
          }
        }
      } catch (err: any) {
        if (
          err?.name !== 'AbortError' &&
          err?.message !== 'The signal has been aborted'
        ) {
          console.error(err)
        }
      }
    })()

    return () => {
      controller.abort()
    }
  }, [nostr, badge, since, until, onClaimRequest])

  return {}
}
