import { useNostrUser } from '@/contexts/nostr-user-context'
import { BadgeDefinition } from '@/types/badge'
import { ClaimContent, ClaimRequestKind } from '@/types/claim'
import { useCallback, useMemo, useState } from 'react'
import { BadgeDefinition as NostrBadgeDefinitionKind } from 'nostr-tools/kinds'
import { useClaimResponses } from './use-claim-responses'
import { NostrEvent } from '@nostrify/nostrify'

export type UserClaimReturn = {
  currentBadge: BadgeDefinition | null
  isLoading: boolean
  claimResponse: { success: boolean; message: string } | null
  claimBadge: (
    claimContent: ClaimContent,
    nonce: string,
    time: number
  ) => Promise<NostrEvent>
}

export const useUserClaim = (): UserClaimReturn => {
  const { currentBadge, nostr, signer } = useNostrUser()
  const [isLoading, setIsLoading] = useState(false)
  const [claimResponse, setClaimResponse] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const since = useMemo(() => Math.floor(new Date().getTime() / 1000), [])

  const [adminPubkey, setAdminPubkey] = useState<string | null>(null)

  const claimBadge = useCallback(
    async (claimContent: ClaimContent, nonce: string, time: number) => {
      if (!nostr) {
        throw new Error('Nostr pool not initialized')
      }
      if (!signer) {
        throw new Error('Signer not initialized')
      }
      if (!currentBadge) {
        throw new Error('No badge selected')
      }
      setIsLoading(true)
      setAdminPubkey(await signer.getPublicKey())

      const event = {
        kind: ClaimRequestKind,
        tags: [
          ['p', currentBadge.pubkey],
          [
            'a',
            `${NostrBadgeDefinitionKind}:${currentBadge.pubkey}:${currentBadge.id}`
          ],
          ['nonce', nonce],
          ['t', time.toString()]
        ],
        content: JSON.stringify(claimContent),
        created_at: Math.floor(Date.now() / 1000),
        pubkey: await signer.getPublicKey()
      }

      console.info('Event ready!')
      console.dir(event)

      const signed = await signer.signEvent(event)
      nostr.event(signed, { signal: AbortSignal.timeout(5000) })

      return signed
    },
    [currentBadge, nostr, signer]
  )

  const handleClaimResponse = useCallback(
    (event: NostrEvent) => {
      console.info('**** Claim response received ****')
      console.dir(event)

      const content = JSON.parse(event.content)
      setClaimResponse({
        success: content.success,
        message: content.success ? 'Badge claimed successfully' : content.error
      })
    },
    [setClaimResponse]
  )

  useClaimResponses({
    badge: currentBadge,
    pubkey: adminPubkey,
    since,
    enabled: !!currentBadge && !!adminPubkey,
    onClaimResponse: handleClaimResponse
  })

  return { currentBadge, isLoading, claimBadge, claimResponse }
}
