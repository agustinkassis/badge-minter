import type React from 'react'
import { NostrAdminProvider } from '@/contexts/nostr-admin-context'
import { NostrProvider } from '@/contexts/nostr-provider'
import { NOSTR_RELAYS } from '@/constants/config'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NostrProvider relays={NOSTR_RELAYS}>
      <NostrAdminProvider>{children}</NostrAdminProvider>
    </NostrProvider>
  )
}
