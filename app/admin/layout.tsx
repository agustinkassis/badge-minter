import type React from 'react'
import { NostrAdminProvider } from '@/contexts/nostr-admin-context'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <NostrAdminProvider>{children}</NostrAdminProvider>
}
