import { useNostrUser } from '@/contexts/nostr-user-context'

export const useUserClaim = () => {
  const { currentBadge } = useNostrUser()

  return { currentBadge }
}
