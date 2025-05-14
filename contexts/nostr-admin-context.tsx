'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { nip19 } from 'nostr-tools'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { BadgeDefinition } from '@/types/badge'
import { useNostr } from '@nostrify/react'
import { NSecSigner } from '@nostrify/nostrify'

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
  nostr: any
  signer: NSecSigner | null
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

  // Use Nostrify pool from context
  const { nostr } = useNostr()
  const [signer, setSigner] = useState<NSecSigner | null>(null)

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
        let privateKeyBytes: Uint8Array
        if (privateKey.startsWith('nsec')) {
          privateKeyBytes = nip19.decode(privateKey).data as Uint8Array
        } else {
          privateKeyBytes = hexToBytes(privateKey)
        }
        sessionStorage.setItem('nostrPrivateKey', bytesToHex(privateKeyBytes))
        const s = new NSecSigner(privateKeyBytes)
        setSigner(s)
        s.getPublicKey().then(pk => {
          setPublicKey(pk)
          const npub = nip19.npubEncode(pk)
          setNpubAddress(npub)
          setIsLoading(false)
        })
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)))
        clearKeys()
        setIsLoading(false)
      }
    } else {
      setPublicKey(null)
      setNpubAddress(null)
      setSigner(null)
    }
  }, [privateKey])

  const setPrivateKey = (key: string) => {
    setPrivateKeyState(key)
  }

  const clearKeys = () => {
    setPrivateKeyState(null)
    setPublicKey(null)
    setNpubAddress(null)
    setSigner(null)
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
    setCurrentBadge,
    nostr,
    signer
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
