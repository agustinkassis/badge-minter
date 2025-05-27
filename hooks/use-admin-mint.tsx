import { useCallback, useMemo, useState } from 'react'
import { NonceService } from '@/lib/nonce-service'
import { useClaimRequests } from './use-claim-requests'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { NostrEvent } from '@nostrify/nostrify'
import { BadgeAward } from '@/types/badge'
import { useBadges } from '@/hooks/use-badges'
import { EventTemplate } from 'nostr-tools'
import { useNostr } from '@nostrify/react'
import { getTagValue } from '@/lib/nostr'
import { ClaimContent, ClaimResponseKind } from '@/types/claim'
import { NonceEntry } from '@/types/nonce'
import { useClaimers } from './use-claimers'

const NONCE_EXPIRATION_SECONDS = parseInt(
  process.env.NONCE_EXPIRATION_SECONDS || '120'
)

export interface UseAdminMintProps {
  onNewAward?: (award: BadgeAward) => void
}

export interface UseAdminMintReturn {
  generateNonce: () => NonceEntry
  burnNonce: (nonce: string, t: number) => boolean
  awards: BadgeAward[]
}

export const useAdminMint = ({
  onNewAward
}: UseAdminMintProps = {}): UseAdminMintReturn => {
  const [nonceService] = useState(() => new NonceService())
  const { currentBadge } = useNostrAdmin()
  const { awards, award } = useBadges({ badge: currentBadge })
  const { signer } = useNostrAdmin()
  const now = useMemo(() => Math.floor(Date.now() / 1000), [])
  const { nostr } = useNostr()
  const { claimerExists } = useClaimers(currentBadge?.naddr || '')

  const respondClaim = useCallback(
    async (claimEvent: NostrEvent, error: string | null = null) => {
      console.info('Response claim received', claimEvent)

      const event = {
        content: JSON.stringify({ success: error === null, error: error }),
        kind: ClaimResponseKind,
        tags: [
          ['p', claimEvent.pubkey],
          ['a', getTagValue(claimEvent, 'a')],
          ['e', claimEvent.id]
        ],
        created_at: Math.floor(Date.now() / 1000)
      } as EventTemplate

      const signedEvent = await signer?.signEvent(event)!

      console.info('*** Sending response claim ***')
      console.dir(signedEvent)

      nostr.event(signedEvent)
    },
    [signer, nostr]
  )

  const onClaimRequest = useCallback(
    async (event: NostrEvent) => {
      console.info('Claim request received', event)

      try {
        const nonce = getTagValue(event, 'nonce')
        const t = parseInt(getTagValue(event, 't') || '0')

        if (!nonce) {
          throw new Error('No nonce')
        }

        if (!t) {
          throw new Error('No timestamp')
        }

        if (t < Math.floor(Date.now() / 1000)) {
          throw new Error('Timestamp is expired')
        }

        const valid = burnNonce(nonce, t)

        if (!valid) {
          throw new Error('Invalid nonce')
        }

        const claim = JSON.parse(event.content) as ClaimContent

        if (claimerExists(claim.pubkey)) {
          throw new Error('Badge already awarded for this pubkey')
        }

        const badgeAward = await award(claim.pubkey, currentBadge!, claim)
        respondClaim(event)
        onNewAward?.(badgeAward)
      } catch (e: unknown) {
        respondClaim(event, (e as Error).message)
      }
    },
    [currentBadge, award, onNewAward, respondClaim, now]
  )

  // Starts claimRequests subscription
  useClaimRequests({
    since: now,
    badge: currentBadge || undefined,
    onClaimRequest
  })

  const generateNonce = useCallback((): NonceEntry => {
    const now = Math.floor(Date.now() / 1000) + NONCE_EXPIRATION_SECONDS
    const nonce = nonceService.generateNonce(currentBadge?.naddr || '', now)
    return {
      nonce,
      naddr: currentBadge?.naddr || '',
      time: now
    }
  }, [currentBadge, nonceService])

  const burnNonce = useCallback(
    (nonce: string, t: number) => {
      console.info('Burning nonce', nonce, t)
      console.info('Current badge', currentBadge)

      // return false
      return nonceService.verifyNonce(nonce, currentBadge!.naddr!, t)
    },
    [currentBadge, nonceService]
  )

  return { generateNonce, burnNonce, awards }
}
