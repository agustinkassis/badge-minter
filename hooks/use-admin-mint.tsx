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
import { ClaimResponseKind } from '@/types/claim'

export interface UseAdminMintProps {
  onNewAward?: (award: BadgeAward) => void
}

export interface UseAdminMintReturn {
  generateNonce: () => string
  burnNonce: (nonce: string) => boolean
  awards: BadgeAward[]
}

export const useAdminMint = ({
  onNewAward
}: UseAdminMintProps = {}): UseAdminMintReturn => {
  const [nonceService] = useState(() => new NonceService())
  const { currentBadge } = useNostrAdmin()
  const { awards, award } = useBadges({ badge: currentBadge })
  const { signer } = useNostrAdmin()
  const now = useMemo(() => Date.now() / 1000, [])
  const { nostr } = useNostr()

  const respondClaim = useCallback(
    async (award: BadgeAward) => {
      console.info('Response claim received', award)

      const claimEvent = award.event

      const event = {
        content: JSON.stringify(award),
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
      const badgeAward = await award(
        event.pubkey,
        currentBadge!,
        JSON.parse(event.content)
      )

      respondClaim(badgeAward)
      onNewAward?.(badgeAward)
    },
    [currentBadge, award, onNewAward, respondClaim]
  )

  // Starts claimRequests subscription
  useClaimRequests({
    since: now,
    until: Infinity,
    badge: currentBadge || undefined,
    onClaimRequest
  })

  const generateNonce = () => {
    return nonceService.generateNonce()
  }

  const burnNonce = (nonce: string) => {
    return nonceService.verifyNonce(nonce)
  }

  return { generateNonce, burnNonce, awards }
}
