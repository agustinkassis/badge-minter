import { useEffect, useRef, useState } from 'react'
import { useNostr } from '@nostrify/react'
import { NostrEvent, NostrFilter } from '@nostrify/nostrify'

interface UseSubscriptionProps {
  filter?: NostrFilter
  closeOnEose?: boolean
}

export function useSubscription({
  filter,
  closeOnEose = false
}: UseSubscriptionProps = {}) {
  const { nostr } = useNostr()
  const [events, setEvents] = useState<NostrEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!nostr || !filter) return
    setEvents([])
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    ;(async () => {
      for await (const msg of nostr.req([filter], {
        signal: controller.signal
      })) {
        if (msg[0] === 'EVENT') {
          setEvents((prev: NostrEvent[]) => [...prev, msg[2]])
        }
        if (closeOnEose && msg[0] === 'EOSE') {
          controller.abort()
          setIsLoading(false)
          break
        }
      }
    })()

    return () => {
      controller.abort()
    }
  }, [JSON.stringify(filter), nostr])

  return { events, isLoading }
}
