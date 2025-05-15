import { useEffect, useRef, useState } from 'react'
import { useNostr } from '@nostrify/react'
import { NostrEvent, NostrFilter } from '@nostrify/nostrify'

interface UseSubscriptionProps {
  filter?: NostrFilter
  closeOnEose?: boolean
  enabled?: boolean
  onEvent?: (event: NostrEvent) => void
  onError?: (error: Error) => void
}

export function useSubscription({
  filter,
  closeOnEose = false,
  enabled = true,
  onEvent,
  onError
}: UseSubscriptionProps = {}) {
  const { nostr } = useNostr()
  const [events, setEvents] = useState<NostrEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!nostr || !filter || !enabled) return

    setEvents([])
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    ;(async () => {
      try {
        for await (const msg of nostr.req([filter], {
          signal: controller.signal
        })) {
          if (msg[0] === 'EVENT') {
            onEvent && onEvent(msg[2])
            setEvents((prev: NostrEvent[]) => [...prev, msg[2]])
          }
          if (closeOnEose && msg[0] === 'EOSE') {
            controller.abort()
            setIsLoading(false)
            break
          }
        }
      } catch (err: any) {
        if (
          err?.name !== 'AbortError' &&
          err?.message !== 'The signal has been aborted'
        ) {
          onError?.(err)
        }
      }
    })()

    return () => {
      controller.abort()
    }
  }, [JSON.stringify(filter), nostr, onEvent, enabled])

  return { events, isLoading, controller: abortRef.current }
}
