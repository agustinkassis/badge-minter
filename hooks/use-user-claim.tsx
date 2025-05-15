import { useNostrUser } from '@/contexts/nostr-user-context'
import { BadgeDefinition } from '@/types/badge'
import { ClaimContent } from '@/types/claim'
import { useState } from 'react'

export type UserClaimReturn = {
  currentBadge: BadgeDefinition | null
  isLoading: boolean
  claimBadge: (claimContent: ClaimContent, nonce: string) => Promise<any>
  claimResponse: { success: boolean; message: string } | null
}

export const useUserClaim = (): UserClaimReturn => {
  const { currentBadge, nostr, signer } = useNostrUser()
  const [isLoading, setIsLoading] = useState(false)
  const [claimResponse, setClaimResponse] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const claimBadge = async (claimContent: ClaimContent, nonce: string) => {
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

    const event = {
      kind: 25666,
      tags: [
        ['p', currentBadge.pubkey],
        ['a', `30009:${currentBadge.pubkey}:${currentBadge.id}`],
        ['nonce', nonce]
      ],
      content: JSON.stringify(claimContent),
      created_at: Math.floor(Date.now() / 1000),
      pubkey: await signer.getPublicKey()
    }

    console.info('Event ready!')
    console.dir(event)

    const signed = await signer.signEvent(event)
    nostr.event(signed, { signal: AbortSignal.timeout(5000) })

    setIsLoading(false)
    setTimeout(() => {
      setClaimResponse({ success: true, message: 'Badge claimed successfully' })
    }, 600)
    return signed
  }

  return { currentBadge, isLoading, claimBadge, claimResponse }
}
