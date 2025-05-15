import { BadgeDefinition } from '@/types/badge'
import { NostrEvent, NPool } from '@nostrify/nostrify'
import { isValid } from 'nostr-tools/nip05'
import { AddressPointer, decode } from 'nostr-tools/nip19'

// Helper to extract tag value from event.tags
export function getTagValue(
  event: NostrEvent,
  tagName: string
): string | undefined {
  const tag = event.tags?.find((t: string[]) => t[0] === tagName)
  return tag ? tag[1] : undefined
}

export async function fetchBadge(
  naddr: string,
  nostr: NPool // NPool from @nostrify/nostrify
): Promise<BadgeDefinition | null> {
  const {
    data: { identifier, kind, pubkey }
  } = decode(naddr) as unknown as {
    type: 'nevent'
    data: AddressPointer
  }

  const filters = [{ authors: [pubkey], kinds: [kind], '#d': [identifier] }]

  console.info('Fetching badge...')
  console.dir(filters)

  let event = null
  for await (const msg of nostr.req(filters)) {
    if (msg[0] === 'EVENT') {
      event = msg[2]
      break
    }
  }

  console.info('Badge fetched!')
  console.dir(event)

  if (!event) return null

  return {
    id: identifier,
    name: getTagValue(event, 'name') || 'No name',
    description: getTagValue(event, 'description') || 'No description',
    image: getTagValue(event, 'image') || 'No image',
    pubkey: event.pubkey,
    naddr: naddr
  }
}

export function isValidPubkey(pubkey: string): boolean {
  return /^[a-zA-Z0-9]{66}$/.test(pubkey)
}
