'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Key, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Footer } from '@/components/footer'
import useLocalStorage from '@/hooks/use-local-storage'

const NEXT_PUBLIC_MOCK_NSEC = process.env.NEXT_PUBLIC_MOCK_NSEC || ''

export default function AdminSetupPage() {
  const router = useRouter()
  const {
    setPrivateKey,
    setBunkerConnection,
    isLoading: contextLoading,
    error: contextError,
    loginMethod
  } = useNostrAdmin()
  const [privateKeyInput, setPrivateKeyInput] = useLocalStorage<string | null>(
    'privateKey',
    NEXT_PUBLIC_MOCK_NSEC || null
  )
  const [bunkerInput, setBunkerInput] = useState('')
  const [tab, setTab] = useState<'privateKey' | 'bunker'>('privateKey')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (tab === 'privateKey') {
        if (!privateKeyInput?.trim()) {
          throw new Error('Private key is required')
        }
        setPrivateKey(privateKeyInput)
        setTimeout(() => {
          setIsLoading(false)
          router.push('/admin/select-badge')
        }, 1000)
      } else if (tab === 'bunker') {
        if (!bunkerInput.trim()) {
          throw new Error('Bunker connection string is required')
        }
        const match = bunkerInput.match(/^bunker:\/\/([a-zA-Z0-9]+)(\\?(.+))?$/)
        if (!match) {
          throw new Error('Invalid bunker connection string')
        }
        const pubkey = match[1]
        const params = new URLSearchParams(match[3] || '')
        const relay = params.get('relay')
        const secret = params.get('secret') || undefined
        if (!relay) throw new Error('Relay is required in bunker string')
        await setBunkerConnection({ pubkey, relay: relay!, secret })
        setTimeout(() => {
          setIsLoading(false)
          router.push('/admin/select-badge')
        }, 1000)
      }
    } catch (err) {
      console.error('Error during login:', err)
      setError(err instanceof Error ? err.message : String(err))
      setIsLoading(false)
    }
  }

  // Display context error if present
  const displayError = error || (contextError ? contextError.message : null)

  return (
    <div className="container relative flex min-h-screen flex-col px-4 py-10">
      {/* Decorative elements */}
      <div className="flamingo flamingo-1 animate-float"></div>
      <div
        className="flamingo flamingo-2 animate-float"
        style={{ animationDelay: '-2s' }}
      ></div>
      <div className="lightning lightning-1 animate-pulse"></div>

      <Link
        href="/"
        className="mb-6 flex items-center text-sm font-bold text-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        BACK TO HOME
      </Link>

      <Card className="card-mint border-none mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight text-primary">
            ADMIN SETUP
          </CardTitle>
          <CardDescription>Choose your login method</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Switcher */}
          <div className="flex mb-6 gap-2">
            <Button
              type="button"
              variant={tab === 'privateKey' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTab('privateKey')}
            >
              Private Key
            </Button>
            <Button
              type="button"
              variant={tab === 'bunker' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTab('bunker')}
            >
              Nsec Bunker
            </Button>
          </div>

          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {tab === 'privateKey' && (
              <div className="space-y-2">
                <Label htmlFor="privateKey" className="font-bold">
                  YOUR NOSTR PRIVATE KEY
                </Label>
                <div className="relative flex flex-col">
                  {privateKeyInput !== null ? (
                    <Button
                      type="button"
                      variant={'destructive'}
                      className="w-full"
                      onClick={e => setPrivateKeyInput(null)}
                    >
                      Remove Stored Private Key
                    </Button>
                  ) : (
                    <>
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <Input
                        id="privateKey"
                        type={'password'}
                        placeholder="nsec..."
                        value={privateKeyInput || ''}
                        onChange={e => setPrivateKeyInput(e.target.value)}
                        className="pl-10 pr-10 border-primary"
                        required
                      />
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your private key is used to sign POV badges. It never leaves
                  your device.
                </p>
              </div>
            )}
            {tab === 'bunker' && (
              <div className="space-y-2">
                <Label htmlFor="bunker" className="font-bold">
                  BUNKER CONNECTION STRING
                </Label>
                <Input
                  id="bunker"
                  type="text"
                  placeholder="bunker://npub...@relay?secret=..."
                  value={bunkerInput}
                  onChange={e => setBunkerInput(e.target.value)}
                  className="border-primary"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste your nsec bunker connection string (format:
                  bunker://npub...@relay?secret=...)
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full btn-pill bg-primary text-white hover:bg-primary/90"
              disabled={
                (tab === 'privateKey' &&
                  (!privateKeyInput || isLoading || contextLoading)) ||
                (tab === 'bunker' &&
                  (!bunkerInput || isLoading || contextLoading))
              }
            >
              {isLoading || contextLoading
                ? 'VERIFYING...'
                : tab === 'privateKey'
                  ? 'CONTINUE TO POV SELECTION'
                  : 'CONNECT TO BUNKER'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Footer />
    </div>
  )
}
