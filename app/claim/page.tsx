'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
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
import { useNostrUser } from '@/contexts/nostr-user-context'
import { fetchBadge } from '@/lib/nostr'
import { Footer } from '@/components/footer'
import { motion } from 'framer-motion'
import { nip19 } from 'nostr-tools'
import { useUserClaim } from '@/hooks/use-user-claim'
import { ClaimContent } from '@/types/claim'
import { useProfile } from '@/hooks/use-profile'
import { isNip05 } from 'nostr-tools/nip05'

export default function ClaimPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const nonce = searchParams.get('nonce')
  const naddr = searchParams.get('naddr') || undefined
  const time = searchParams.get('t') || undefined
  const [nostrAddress, setNostrAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [miningProgress, setClaimingProgress] = useState(0)
  const [showMiningAnimation, setShowClaimingAnimation] = useState(false)
  const [claimingStage, setClaimingStage] = useState<
    'resolving' | 'claiming' | 'complete'
  >('resolving')
  const [resolvedPubkey, setResolvedPubkey] = useState<string | null>(null)
  const { nostr } = useNostrUser()
  const { currentBadge, setCurrentBadge } = useNostrUser()
  const { profile } = useProfile(resolvedPubkey || '')
  const { claimBadge, claimResponse } = useUserClaim()

  useEffect(() => {
    if (!nonce) {
      setError('Invalid or expired QR code')
      return
    }
  }, [nonce])

  useEffect(() => {
    if (!nostr) {
      return
    }
    if (!naddr) {
      setError('No naddr provided')
      return
    }
    setIsLoading(true)

    try {
      fetchBadge(naddr, nostr).then(badge => {
        if (badge) {
          setCurrentBadge(badge)
        } else {
          // setError('Badge not found')
        }
      })
    } catch (error: unknown) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [naddr, nostr]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile === undefined) {
      return
    }
    console.info('Profile found!')
    console.dir(profile)

    const claimContent: ClaimContent = {
      pubkey: resolvedPubkey!,
      nip05: profile?.nip05 || nostrAddress,
      image: profile?.picture || 'http://noimage',
      displayName: profile?.displayName || 'Unknown'
    }

    setClaimingStage('claiming')
    setClaimingProgress(60)

    console.info('Claiming badge with nonce', nonce, 'and time', time)
    claimBadge(claimContent, nonce!, parseInt(time!))
      .then(() => {
        setClaimingProgress(80)
      })
      .catch(error => {
        console.dir(error)
        setError('Error claiming badge')
      })
  }, [profile, nostrAddress, nonce, resolvedPubkey, time]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!claimResponse) {
      return
    }

    if (claimResponse.success) {
      setClaimingStage('complete')
      setClaimingProgress(100)
      setTimeout(() => {
        router.replace(
          `/claim/success?npub=${nip19.npubEncode(resolvedPubkey!)}`
        )
      }, 600)
    } else {
      setError(claimResponse.message)
      setClaimingProgress(0)
    }
  }, [claimResponse, resolvedPubkey]) // eslint-disable-line react-hooks/exhaustive-deps

  const startClaimingProcess = () => {
    setShowClaimingAnimation(true)
    setClaimingProgress(0)
    setClaimingStage('resolving')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate Nostr address (accept npub, nprofile, or email-like format)
    const isValidNostrFormat =
      nostrAddress.startsWith('npub') || nostrAddress.startsWith('nprofile')

    if (!isValidNostrFormat && !isNip05(nostrAddress)) {
      setError(
        'Please enter a valid Nostr address (npub, nprofile, or name@domain.com)'
      )
      setIsLoading(false)
      return
    }

    // Handle NIP-05 resolution
    if (isNip05(nostrAddress)) {
      try {
        setClaimingProgress(10)
        const [_name, _domain] = nostrAddress.split('@')
        const name = _name.toLowerCase().trim()
        const domain = _domain.toLowerCase().trim()

        const nip05Url = `https://${domain}/.well-known/nostr.json?name=${name}`

        const response = await fetch(nip05Url)

        setClaimingProgress(20)
        console.info('HERE')
        if (!response.ok) {
          throw new Error('Failed to resolve NIP-05 address')
        }

        const data = await response.json()
        const pubkey = data.names[name]

        console.info('pubkey', pubkey)

        if (!pubkey) {
          throw new Error('NIP-05 address not found')
        }

        // Set the resolved pubkey to fetch profile
        setResolvedPubkey(pubkey)
      } catch (error) {
        setError(
          'Failed to resolve NIP-05 address. Please try using your npub directly.'
        )
        setIsLoading(false)
        return
      }
    } else if (isValidNostrFormat) {
      try {
        // Decode npub/nprofile to get pubkey
        const decoded = nip19.decode(nostrAddress)
        if (decoded.type === 'npub') {
          setResolvedPubkey(decoded.data)
        } else if (decoded.type === 'nprofile') {
          setResolvedPubkey(decoded.data.pubkey)
        }
      } catch (error) {
        setError('Invalid Nostr address format')
        setIsLoading(false)
        return
      }
    }

    // Start the mining animation
    startClaimingProcess()
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
                setError(null)
              }}
            >
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!currentBadge) {
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
                {claimingStage === 'resolving' && 'RESOLVING NIP-05'}
                {claimingStage === 'claiming' && 'CLAIMING BADGE'}
                {claimingStage === 'complete' && 'BADGE AWARDED'}
              </CardTitle>
              <CardDescription className="text-white/80">
                {claimingStage === 'resolving' &&
                  'Resolving your Nostr address...'}
                {claimingStage === 'claiming' && 'Claiming your badge...'}
                {claimingStage === 'complete' &&
                  'Your POV badge has been successfully minted!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-4">
                  {claimingStage !== 'complete' ? (
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
                  {claimingStage === 'resolving' && (
                    <div className="space-y-1">
                      <p>Resolving NIP-05 address...</p>
                      <p>Getting your Nostr profile...</p>
                    </div>
                  )}
                  {claimingStage === 'claiming' && (
                    <div className="space-y-1">
                      <p>Generating claim event...</p>
                      <p>Publishing to Relays...</p>
                    </div>
                  )}
                  {claimingStage === 'complete' && (
                    <div className="space-y-1">
                      <p>Badge successfully minted!</p>
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
        <CardContent className="space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="bg-white/50 p-3 rounded-full mb-3"
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4
                }}
              >
                <img
                  src={currentBadge.image || '/placeholder.svg'}
                  alt={currentBadge.name}
                  className="h-48 w-48 rounded-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Label htmlFor="nostrAddress" className="font-bold uppercase">
                  Your Nostr Address
                </Label>
              </motion.div>
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
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
              </motion.div>
              <motion.p
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                Enter your Nostr public key (npub), profile (nprofile), or Nostr
                address (name@domain.com)
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full btn-pill bg-primary text-white hover:bg-primary/90"
                disabled={!nostrAddress || isLoading}
              >
                {isLoading ? 'PROCESSING...' : 'MINT POV BADGE'}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Footer />
      </motion.div>
    </div>
  )
}
