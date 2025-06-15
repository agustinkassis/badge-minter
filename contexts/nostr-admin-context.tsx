'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { nip19 } from 'nostr-tools'
import { generateSecretKey } from 'nostr-tools'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { BadgeDefinition } from '@/types/badge'
import { useNostr } from '@nostrify/react'
import { NSecSigner, NConnectSigner, NRelay1 } from '@nostrify/nostrify'

interface NostrAdminContextType {
  privateKey: string | null
  publicKey: string | null
  npubAddress: string | null
  setPrivateKey: (key: string) => void
  setBunkerConnection: (conn: {
    pubkey: string
    relay: string
    secret?: string
  }) => Promise<void>
  clearKeys: () => void
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  currentBadge: BadgeDefinition | null
  setCurrentBadge: (badge: BadgeDefinition | null) => void
  nostr: any
  signer: NSecSigner | NConnectSigner | null
  loginMethod: 'privateKey' | 'bunker' | null
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
  const [loginMethod, setLoginMethod] = useState<
    'privateKey' | 'bunker' | null
  >(null)

  // Use Nostrify pool from context
  const { nostr } = useNostr()
  const [signer, setSigner] = useState<NSecSigner | NConnectSigner | null>(null)

  // Initialize from sessionStorage/localStorage on mount
  useEffect(() => {
    const storedPrivateKey = sessionStorage.getItem('nostrPrivateKey')
    const storedLoginMethod = sessionStorage.getItem('nostrLoginMethod')
    if (storedPrivateKey && storedLoginMethod === 'privateKey') {
      setPrivateKeyState(storedPrivateKey)
      setLoginMethod('privateKey')
    } else if (storedLoginMethod === 'bunker') {
      // Only set loginMethod, do not auto-connect
      setLoginMethod('bunker')
    }
  }, [])

  // Derive public key when private key changes (privateKey login)
  useEffect(() => {
    if (loginMethod === 'privateKey' && privateKey) {
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
        sessionStorage.setItem('nostrLoginMethod', 'privateKey')
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
    } else if (loginMethod !== 'bunker') {
      setPublicKey(null)
      setNpubAddress(null)
      setSigner(null)
    }
  }, [privateKey, loginMethod])

  // Bunker connection logic
  const setBunkerConnection = async ({
    pubkey,
    relay,
    secret
  }: {
    pubkey: string
    relay: string
    secret?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      setLoginMethod('bunker')
      sessionStorage.setItem('nostrLoginMethod', 'bunker')
      // Try to get localKeyHex from localStorage
      let localKeyHex: string | undefined
      let localKey: Uint8Array | undefined
      const sessionStr = localStorage.getItem('nostrBunkerSession')
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr)
          if (
            session.pubkey === pubkey &&
            session.relay === relay &&
            typeof session.localKeyHex === 'string'
          ) {
            localKeyHex = session.localKeyHex
            if (localKeyHex) {
              localKey = hexToBytes(localKeyHex)
            }
          }
        } catch {}
      }
      if (!localKeyHex || !localKey) {
        localKey = generateSecretKey()
        localKeyHex = bytesToHex(localKey)
      }
      // Always persist the session
      localStorage.setItem(
        'nostrBunkerSession',
        JSON.stringify({ pubkey, relay, secret, localKeyHex })
      )
      const relayObj = new NRelay1(relay)
      const local = new NSecSigner(localKey)
      const s = new NConnectSigner({ pubkey, signer: local, relay: relayObj })
      if (secret) await s.connect(secret)
      setSigner(s)
      setPublicKey(pubkey)
      setNpubAddress(nip19.npubEncode(pubkey))
      setIsLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)))
      clearKeys()
      setIsLoading(false)
      throw error
    }
  }

  const setPrivateKey = (key: string) => {
    setLoginMethod('privateKey')
    setPrivateKeyState(key)
  }

  const clearKeys = () => {
    setPrivateKeyState(null)
    setPublicKey(null)
    setNpubAddress(null)
    setSigner(null)
    setLoginMethod(null)
    sessionStorage.removeItem('nostrPrivateKey')
    sessionStorage.removeItem('nostrLoginMethod')
    localStorage.removeItem('nostrBunkerSession')
  }

  const value = {
    privateKey,
    publicKey,
    npubAddress,
    setPrivateKey,
    setBunkerConnection,
    clearKeys,
    isAuthenticated: !!signer && !!publicKey,
    isLoading,
    error,
    currentBadge,
    setCurrentBadge,
    nostr,
    signer,
    loginMethod
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
