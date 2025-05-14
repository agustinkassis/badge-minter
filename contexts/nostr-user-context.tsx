'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { generateSecretKey, nip19 } from 'nostr-tools'
import { BadgeDefinition } from '@/types/badge'
import { useNostr } from '@nostrify/react'
import { NPool, NSecSigner } from '@nostrify/nostrify'

interface NostrUserContextType {
  isLoading: boolean
  error: Error | null
  currentBadge: BadgeDefinition | null
  setCurrentBadge: (badge: BadgeDefinition | null) => void
  nostr: NPool
  signer: NSecSigner | null
}

const NostrUserContext = createContext<NostrUserContextType | undefined>(
  undefined
)

export function NostrUserProvider({ children }: { children: ReactNode }) {
  const [privateKey] = useState<Uint8Array>(generateSecretKey())
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [npubAddress, setNpubAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentBadge, setCurrentBadge] = useState<BadgeDefinition | null>(null)

  // Use Nostrify pool from context
  const { nostr } = useNostr()
  const [signer, setSigner] = useState<NSecSigner | null>(null)

  useEffect(() => {
    if (privateKey) {
      try {
        setIsLoading(true)
        setError(null)
        const s = new NSecSigner(privateKey)
        setSigner(s)
        s.getPublicKey().then(pk => {
          setPublicKey(pk)
          const npub = nip19.npubEncode(pk)
          setNpubAddress(npub)
          setIsLoading(false)
        })
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)))
        setIsLoading(false)
      }
    } else {
      setPublicKey(null)
      setNpubAddress(null)
      setSigner(null)
    }
  }, [privateKey])

  const value = {
    privateKey,
    publicKey,
    npubAddress,
    isLoading,
    error,
    currentBadge,
    setCurrentBadge,
    nostr,
    signer
  }

  return (
    <NostrUserContext.Provider value={value}>
      {children}
    </NostrUserContext.Provider>
  )
}

export function useNostrUser() {
  const context = useContext(NostrUserContext)
  if (context === undefined) {
    throw new Error('useNostrUser must be used within a NostrUserProvider')
  }
  return context
}
