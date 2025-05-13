import type React from 'react'
import { NostrUserProvider } from '@/contexts/nostr-user-context'

export default function UserLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <NostrUserProvider>{children}</NostrUserProvider>
}
