'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { useLogin, useNdk } from 'nostr-hooks'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { BadgeDefinition } from '@/types/badge'
import { NOSTR_RELAYS } from '@/constants/config'
import { bytesToHex } from '@noble/hashes/utils'

interface NostrUserContextType {
  isLoading: boolean
  error: Error | null
  currentBadge: BadgeDefinition | null
  setCurrentBadge: (badge: BadgeDefinition | null) => void
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

  const { initNdk, ndk } = useNdk()
  const { loginWithPrivateKey } = useLogin()

  // Initialize NDK with relays
  useEffect(() => {
    initNdk({
      explicitRelayUrls: NOSTR_RELAYS
    })
  }, [initNdk])

  // Connect to relays when NDK is initialized
  useEffect(() => {
    if (ndk) {
      ndk.connect()
    }
  }, [ndk])

  // Derive public key when private key changes
  useEffect(() => {
    if (privateKey) {
      try {
        setIsLoading(true)
        setError(null)

        const derivedPublicKey = getPublicKey(privateKey)
        setPublicKey(derivedPublicKey)

        // Convert hex public key to npub format
        const npub = nip19.npubEncode(derivedPublicKey)
        setNpubAddress(npub)

        loginWithPrivateKey({
          privateKey: bytesToHex(privateKey)
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error deriving public key:', error)
        setError(error instanceof Error ? error : new Error(String(error)))
        setIsLoading(false)
      }
    } else {
      setPublicKey(null)
      setNpubAddress(null)
    }
  }, [privateKey])

  const value = {
    privateKey,
    publicKey,
    npubAddress,
    isLoading,
    error,
    currentBadge,
    setCurrentBadge
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
