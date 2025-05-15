import { NostrEvent } from '@nostrify/nostrify'
import { BadgeDefinition } from '@/types/badge'
import { useSubscription } from '@/hooks/use-subscription'
import { ClaimResponseKind } from '@/types/claim'
import { BadgeDefinition as NostrBadgeDefinitionKind } from 'nostr-tools/kinds'

export interface UseClaimRequestsProps {
  badge?: BadgeDefinition | null
  pubkey?: string | null
  since?: number
  until?: number
  enabled?: boolean
  onClaimResponse: (event: NostrEvent) => void
}

export function useClaimResponses({
  badge,
  pubkey,
  since = 0,
  enabled = true,
  until,
  onClaimResponse
}: UseClaimRequestsProps) {
  const { controller } = useSubscription({
    filter: {
      authors: [badge?.pubkey || ''],
      kinds: [ClaimResponseKind],
      '#p': [pubkey || ''],
      '#a': [`${NostrBadgeDefinitionKind}:${badge?.pubkey}:${badge?.id}`],
      since,
      until
    },
    enabled: enabled && !!badge && !!pubkey,
    onEvent: onClaimResponse,
    onError: console.error
  })

  return { controller }
}
