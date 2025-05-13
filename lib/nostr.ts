import { BadgeDefinition } from '@/types/badge'
import NDK from '@nostr-dev-kit/ndk'
import { AddressPointer, decode } from 'nostr-tools/nip19'

export async function fetchBadge(
  naddr: string,
  ndk: NDK
): Promise<BadgeDefinition | null> {
  const {
    data: { identifier, kind, pubkey }
  } = decode(naddr) as unknown as {
    type: 'nevent'
    data: AddressPointer
  }

  const filters = [{ authors: [pubkey], kinds: [kind], '#d': [identifier] }]

  console.info('FETCHING BADGE')
  console.dir(filters)

  const event = await ndk?.fetchEvent(filters)
  console.info('EVENT')
  console.dir(event)

  if (!event) return null

  return {
    id: identifier,
    name: event.tagValue('name') || 'No name',
    description: event.tagValue('description') || 'No description',
    image: event.tagValue('image') || 'No image',
    pubkey: event.pubkey,
    naddr: naddr
  }
}
