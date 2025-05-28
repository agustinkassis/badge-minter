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
    isLoading: contextLoading,
    error: contextError
  } = useNostrAdmin()
  const [privateKeyInput, setPrivateKeyInput] = useLocalStorage<string | null>(
    'privateKey',
    NEXT_PUBLIC_MOCK_NSEC || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Basic validation
      if (!privateKeyInput?.trim()) {
        throw new Error('Private key is required')
      }

      // Set the private key in the context
      setPrivateKey(privateKeyInput)

      // Navigate to the select badge page after a short delay
      setTimeout(() => {
        setIsLoading(false)
        router.push('/admin/select-badge')
      }, 1000)
    } catch (err) {
      console.error('Error setting private key:', err)
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
          <CardDescription>
            Enter your Nostr private key to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              className="w-full btn-pill bg-primary text-white hover:bg-primary/90"
              disabled={!privateKeyInput || isLoading || contextLoading}
            >
              {isLoading || contextLoading
                ? 'VERIFYING...'
                : 'CONTINUE TO POV SELECTION'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Footer />
    </div>
  )
}
