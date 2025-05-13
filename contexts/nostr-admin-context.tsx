'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { useNdk } from 'nostr-hooks'
import { getPublicKey, nip19 } from 'nostr-tools'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { BadgeDefinition } from '@/types/badge'
import { NOSTR_RELAYS } from '@/constants/config'

interface NostrAdminContextType {
  privateKey: string | null
  publicKey: string | null
  npubAddress: string | null
  setPrivateKey: (key: string) => void
  clearKeys: () => void
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  currentBadge: BadgeDefinition | null
  setCurrentBadge: (badge: BadgeDefinition | null) => void
}

const NostrAdminContext = createContext<NostrAdminContextType | undefined>(
  undefined
)

export function NostrAdminProvider({ children }: { children: ReactNode }) {
  const [privateKey, setPrivateKeyState] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [npubAddress, setNpubAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentBadge, setCurrentBadge] = useState<BadgeDefinition | null>(null)

  const { initNdk, ndk } = useNdk()

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

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const storedPrivateKey = sessionStorage.getItem('nostrPrivateKey')
    if (storedPrivateKey) {
      setPrivateKeyState(storedPrivateKey)
    }
  }, [])

  // Derive public key when private key changes
  useEffect(() => {
    if (privateKey) {
      try {
        setIsLoading(true)
        setError(null)

        // Remove "nsec" prefix if present
        const privateKeyBytes = (
          privateKey.startsWith('nsec')
            ? nip19.decode(privateKey).data
            : hexToBytes(privateKey)
        ) as Uint8Array<ArrayBufferLike>

        // Store in sessionStorage
        sessionStorage.setItem('nostrPrivateKey', bytesToHex(privateKeyBytes))

        // Derive public key using nostr-tools

        const derivedPublicKey = getPublicKey(privateKeyBytes)
        setPublicKey(derivedPublicKey)

        // Convert hex public key to npub format
        const npub = nip19.npubEncode(derivedPublicKey)
        setNpubAddress(npub)

        setIsLoading(false)
      } catch (error) {
        console.error('Error deriving public key:', error)
        setError(error instanceof Error ? error : new Error(String(error)))
        clearKeys()
        setIsLoading(false)
      }
    } else {
      setPublicKey(null)
      setNpubAddress(null)
    }
  }, [privateKey])

  const setPrivateKey = (key: string) => {
    setPrivateKeyState(key)
  }

  const clearKeys = () => {
    setPrivateKeyState(null)
    setPublicKey(null)
    setNpubAddress(null)
    sessionStorage.removeItem('nostrPrivateKey')
  }

  const value = {
    privateKey,
    publicKey,
    npubAddress,
    setPrivateKey,
    clearKeys,
    isAuthenticated: !!privateKey && !!publicKey,
    isLoading,
    error,
    currentBadge,
    setCurrentBadge
  }

  return (
    <NostrAdminContext.Provider value={value}>
      {children}
    </NostrAdminContext.Provider>
  )
}

export function useNostrAdmin() {
  const context = useContext(NostrAdminContext)
  if (context === undefined) {
    throw new Error('useNostrAdmin must be used within a NostrAdminProvider')
  }
  return context
}
