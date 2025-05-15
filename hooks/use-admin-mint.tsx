import { useCallback, useMemo, useState } from 'react'
import { NonceService } from '@/lib/nonce-service'
import { useClaimRequests } from './use-claim-requests'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { NostrEvent } from '@nostrify/nostrify'
import { BadgeAward } from '@/types/badge'
import { useBadges } from '@/hooks/use-badges'

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

  const now = useMemo(() => Date.now() / 1000, [])

  const onClaimRequest = useCallback(
    async (event: NostrEvent) => {
      console.info('Claim request received', event)
      const badgeAward = await award(
        event.pubkey,
        currentBadge!,
        JSON.parse(event.content)
      )
      onNewAward?.(badgeAward)
    },
    [currentBadge, award, onNewAward]
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
