import { useNostrUser } from '@/contexts/nostr-user-context'
import { BadgeDefinition } from '@/types/badge'
import { ClaimContent } from '@/types/claim'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { useNdk } from 'nostr-hooks'
import { useState } from 'react'

export type UserClaimReturn = {
  currentBadge: BadgeDefinition | null
  isLoading: boolean
  claimBadge: (claimContent: ClaimContent, nonce: string) => Promise<NDKEvent>
}

export const useUserClaim = (): UserClaimReturn => {
  const { currentBadge } = useNostrUser()
  const [isLoading, setIsLoading] = useState(false)
  const { ndk } = useNdk()

  const claimBadge = async (claimContent: ClaimContent, nonce: string) => {
    if (!ndk) {
      throw new Error('NDK not initialized')
    }
    if (!currentBadge) {
      throw new Error('No badge selected')
    }
    setIsLoading(true)

    const event = new NDKEvent(ndk, {
      kind: 25666,
      tags: [
        ['p', currentBadge.pubkey],
        ['nonce', nonce]
      ],
      content: JSON.stringify(claimContent)
    })

    await event.sign()
    await event.publish()

    setIsLoading(false)
    return event
  }

  return { currentBadge, isLoading, claimBadge }
}
