import type React from 'react'
import { NostrUserProvider } from '@/contexts/nostr-user-context'
import { NostrProvider } from '@/contexts/nostr-provider'
import { NOSTR_RELAYS } from '@/constants/config'

export default function UserLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NostrProvider relays={NOSTR_RELAYS}>
      <NostrUserProvider>{children}</NostrUserProvider>
    </NostrProvider>
  )
}
