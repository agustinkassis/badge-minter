'use client'

import type React from 'react'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Cpu, CheckCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBadge } from '@/hooks/use-badge'
import { useNostrUser } from '@/contexts/nostr-user-context'

export default function ClaimPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nonce = searchParams.get('nonce')
  const naddr = searchParams.get('naddr') || undefined
  const [nostrAddress, setNostrAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [miningProgress, setMiningProgress] = useState(0)
  const [showMiningAnimation, setShowMiningAnimation] = useState(false)
  const [miningStage, setMiningStage] = useState<
    'mining' | 'verifying' | 'complete'
  >('mining')
  const miningInterval = useRef<NodeJS.Timeout | null>(null)
  const { isLoading: isBadgeLoading, badge } = useBadge({ naddr })
  const { currentBadge, setCurrentBadge } = useNostrUser()

  useEffect(() => {
    if (!nonce) {
      setError('Invalid or expired QR code')
      return
    }
  }, [nonce])

  useEffect(() => {
    if (!isBadgeLoading && !badge) {
      setError('POV nonce not found')
    }
    if (badge) {
      setCurrentBadge(badge)
    }
  }, [badge, isBadgeLoading, setCurrentBadge])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (miningInterval.current) {
        clearInterval(miningInterval.current)
      }
    }
  }, [])

  const startMiningAnimation = () => {
    setShowMiningAnimation(true)
    setMiningProgress(0)
    setMiningStage('mining')

    // Simulate mining progress
    miningInterval.current = setInterval(() => {
      setMiningProgress(prev => {
        const newProgress = prev + Math.random() * 5

        // First stage - mining (0-60%)
        if (newProgress >= 60 && prev < 60) {
          setMiningStage('verifying')
        }

        // Second stage - verifying (60-100%)
        if (newProgress >= 100) {
          if (miningInterval.current) {
            clearInterval(miningInterval.current)
          }

          setMiningStage('complete')

          // Wait a moment to show completion before redirecting
          setTimeout(() => {
            router.replace(`/claim/success`)
          }, 1000)

          return 100
        }

        return newProgress
      })
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate Nostr address (accept npub, nprofile, or email-like format)
    const isValidNostrFormat =
      nostrAddress.startsWith('npub') || nostrAddress.startsWith('nprofile')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValidEmailFormat = emailRegex.test(nostrAddress)

    if (!isValidNostrFormat && !isValidEmailFormat) {
      setError(
        'Please enter a valid Nostr address (npub, nprofile, or name@domain.com)'
      )
      setIsLoading(false)
      return
    }

    // Start the mining animation
    startMiningAnimation()
  }

  if (error) {
    return (
      <div className="container relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {/* Decorative elements */}
        <div className="flamingo flamingo-1 animate-float"></div>
        <div className="lightning lightning-2 animate-pulse"></div>

        <Card className="card-pink border-none w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black tracking-tight text-destructive">
              ERROR
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <p className="mt-4">
              Please scan a new QR code to claim your badge.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              className="btn-pill bg-primary text-white hover:bg-primary/90"
              onClick={() => {
                router.push('/')
              }}
            >
              RETURN TO HOME
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isBadgeLoading || !currentBadge) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        Loading badge definition...
      </div>
    )
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {/* Decorative elements */}
      <div className="flamingo flamingo-1 animate-float"></div>
      <div
        className="flamingo flamingo-3 animate-float"
        style={{ animationDelay: '-3s' }}
      ></div>
      <div className="lightning lightning-2 animate-pulse"></div>

      {/* Mining Animation Overlay */}
      {showMiningAnimation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="card-lavender border-none w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-black tracking-tight text-white">
                {miningStage === 'mining' && 'MINING POV BADGE'}
                {miningStage === 'verifying' && 'VERIFYING PROOF'}
                {miningStage === 'complete' && 'PROOF VERIFIED!'}
              </CardTitle>
              <CardDescription className="text-white/80">
                {miningStage === 'mining' && 'Creating your proof of visit...'}
                {miningStage === 'verifying' &&
                  'Verifying your proof on the Nostr network...'}
                {miningStage === 'complete' &&
                  'Your POV badge has been successfully mined!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-4">
                  {miningStage !== 'complete' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="h-16 w-16 text-white animate-pulse" />
                      <div
                        className="absolute inset-0 border-4 border-white/30 rounded-full animate-spin"
                        style={{
                          borderTopColor: 'white',
                          animationDuration: '1.5s'
                        }}
                      ></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="h-16 w-16 text-white animate-bounce" />
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Progress</span>
                    <span>{Math.round(miningProgress)}%</span>
                  </div>
                  <Progress
                    value={miningProgress}
                    className="h-2 w-full bg-white/20"
                    indicatorClassName="bg-white"
                  />
                </div>

                <div className="mt-4 text-center text-white/80 text-sm">
                  {miningStage === 'mining' && (
                    <div className="space-y-1">
                      <p>Generating cryptographic proof...</p>
                      <p>Computing hash values...</p>
                    </div>
                  )}
                  {miningStage === 'verifying' && (
                    <div className="space-y-1">
                      <p>Connecting to Nostr relays...</p>
                      <p>Verifying badge authenticity...</p>
                    </div>
                  )}
                  {miningStage === 'complete' && (
                    <div className="space-y-1">
                      <p>Badge successfully claimed!</p>
                      <p>Redirecting to your new badge...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="card-mint border-none mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black tracking-tight text-primary">
            CLAIM YOUR POV BADGE
          </CardTitle>
          <CardDescription className="uppercase font-bold">
            {currentBadge.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white/50 p-3 rounded-full mb-3">
              <img
                src={currentBadge.image || '/placeholder.svg'}
                alt={currentBadge.name}
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {currentBadge.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nostrAddress" className="font-bold uppercase">
                Your Nostr Address
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <Input
                  id="nostrAddress"
                  placeholder="npub... or name@domain.com"
                  value={nostrAddress}
                  onChange={e => setNostrAddress(e.target.value)}
                  className="pl-10 border-primary"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Nostr public key (npub), profile (nprofile), or Nostr
                address (name@domain.com)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-pill bg-primary text-white hover:bg-primary/90"
              disabled={!nostrAddress || isLoading}
            >
              {isLoading ? 'PROCESSING...' : 'MINT POV BADGE'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
