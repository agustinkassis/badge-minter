import { BadgeDefinition } from '@/types/badge'
import { AddressPointer, decode } from 'nostr-tools/nip19'

// Helper to extract tag value from event.tags
function getTagValue(event: any, tagName: string): string | undefined {
  const tag = event.tags?.find((t: string[]) => t[0] === tagName)
  return tag ? tag[1] : undefined
}

export async function fetchBadge(
  naddr: string,
  nostr: any // NPool from @nostrify/nostrify
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

  const events = await nostr.query(filters)
  const event = events && events.length > 0 ? events[0] : null

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
