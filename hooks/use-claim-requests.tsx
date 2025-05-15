import { NostrEvent } from '@nostrify/nostrify'
import { BadgeDefinition } from '@/types/badge'
import { useSubscription } from '@/hooks/use-subscription'
import { ClaimRequestKind } from '@/types/claim'
import { BadgeDefinition as NostrBadgeDefinitionKind } from 'nostr-tools/kinds'

export interface UseClaimRequestsProps {
  since?: number
  until?: number
  badge?: BadgeDefinition
  onClaimRequest: (event: NostrEvent) => void
}

export function useClaimRequests({
  since = 0,
  until,
  badge,
  onClaimRequest
}: UseClaimRequestsProps) {
  const { controller } = useSubscription(
    badge && {
      filter: {
        kinds: [ClaimRequestKind],
        '#p': [badge.pubkey],
        '#a': [`${NostrBadgeDefinitionKind}:${badge.pubkey}:${badge.id}`],
        since,
        until
      },
      enabled: !!badge,
      onEvent: onClaimRequest,
      onError: console.error
    }
  )

  return { controller }
}
