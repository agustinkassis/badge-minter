'use client'

import React, { useRef } from 'react'
import { NostrContext } from '@nostrify/react'
import { NPool, NRelay1 } from '@nostrify/nostrify'

export function NostrProvider({
  children,
  relays
}: {
  children: React.ReactNode
  relays: string[]
}) {
  const pool = useRef<NPool | null>(null)
  if (!pool.current) {
    pool.current = new NPool({
      open: (url: string) => new NRelay1(url),
      reqRouter: (filters: any) => new Map(relays.map(url => [url, filters])),
      eventRouter: (_event: any) => relays
    })
  }
  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  )
}
