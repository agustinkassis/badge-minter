'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CheckCircle, Users, User } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminMint } from '@/hooks/use-admin-mint'
import { BadgeAward } from '@/types/badge'
import { NonceEntry } from '@/types/nonce'
import { generateRandomBadgeAward, mockUsers } from '@/constants/mock'
import { useClaimers } from '@/hooks/use-claimers'
import { Button } from '@/components/ui/button'

export default function QRDisplayPage() {
  const router = useRouter()
  const [currentNonce, setCurrentNonce] = useState<NonceEntry>()
  const [claimUrl, setClaimUrl] = useState('')
  const { toast } = useToast()
  const nonceRefreshInterval = useRef<NodeJS.Timeout | null>(null)
  const NONCE_REFRESH_INTERVAL = 2000 // 2 seconds

  const { isAuthenticated, currentBadge } = useNostrAdmin()
  const { claimers, addClaimer, clearClaimers } = useClaimers(
    currentBadge?.naddr || ''
  )

  const onNewAward = useCallback(
    async (award: BadgeAward) => {
      addClaimer(award)

      toast({
        variant: 'primary',
        description: (
          <div className="flex items-center gap-2">
            <img
              src={award.claim?.image || '/placeholder.svg'}
              alt={award.claim?.displayName || 'User'}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <p className="font-bold">{award.claim?.displayName}</p>
              <p className="text-xs opacity-80">@{award.claim?.displayName}</p>
            </div>
          </div>
        )
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast]
  )

  const { generateNonce } = useAdminMint({ onNewAward })

  // Find the selected POV badge
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/admin/setup')
      return
    }

    if (!currentBadge) {
      router.push('/admin/select-badge')
    }
  }, [router, isAuthenticated, currentBadge])

  // Initialize nonce and set up refresh interval
  useEffect(() => {
    // Generate initial nonce
    refreshNonce()

    // Set up interval to refresh nonce
    nonceRefreshInterval.current = setInterval(() => {
      refreshNonce()
    }, NONCE_REFRESH_INTERVAL)

    // Clean up on unmount
    return () => {
      if (nonceRefreshInterval.current) {
        clearInterval(nonceRefreshInterval.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update claim URL when nonce changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const claimUrl =
        currentBadge && currentNonce
          ? `${window.location.origin}/claim?nonce=${currentNonce.nonce}&naddr=${currentBadge.naddr}&t=${currentNonce.time}`
          : ''
      setClaimUrl(claimUrl)
      console.info('Claim URL:', claimUrl)
    }
  }, [currentNonce, currentBadge])

  // Function to refresh the nonce
  const refreshNonce = () => {
    // Generate a new nonce
    const newNonce = generateNonce()
    setCurrentNonce(newNonce)
  }

  // Simulate a POV claim
  const simulateClaim = () => {
    // Select a random user from the available users
    const randomUser = generateRandomBadgeAward()

    // Show toast notification
    toast({
      variant: 'primary',
      description: (
        <div className="flex items-center gap-2">
          <img
            src={randomUser.claim?.image || '/placeholder.svg'}
            alt={randomUser.claim?.displayName}
            className="h-8 w-8 rounded-full"
          />
          <div>
            <p className="font-bold">{randomUser.claim?.displayName}</p>
            <p className="text-xs opacity-80">
              @{randomUser.claim?.displayName}
            </p>
          </div>
        </div>
      )
    })

    // Add the new claimer
    addClaimer(randomUser)
  }

  // Calculate how many claimers to display and how many are hidden
  const displayClaimers = useMemo(
    () => [...claimers].sort((a, b) => b.event.created_at - a.event.created_at),
    [claimers]
  )

  if (!currentBadge) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  const clearStorage = () => {
    confirm('Are you sure you want to clear the storage?') && clearClaimers()
  }

  return (
    <div className="container relative flex min-h-screen flex-col px-4">
      {/* Toast notifications */}
      <Toaster />

      {/* Decorative elements */}
      <div
        className="flamingo flamingo-2 animate-float"
        style={{ animationDelay: '-2s' }}
      ></div>
      <div className="lightning lightning-1 animate-pulse"></div>

      <Card className="card-mint border-none mx-auto w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black tracking-tight text-primary">
            CLAIM YOUR BADGE{' '}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex flex-col md:flex-row gap-6">
            {/* POV Display left */}
            <div
              onClick={() =>
                window.open(
                  `https://badges.page/a/${currentBadge.naddr}`,
                  '_blank'
                )
              }
              role="link"
              tabIndex={0}
              className="rounded-lg bg-white/50 p-4 hover:bg-white/80 cursor-pointer w-[50%]"
            >
              <div className="flex items-center flex-col">
                <h3 className="font-bold uppercase text-3xl">
                  {currentBadge.name}
                </h3>
                <div className="h-auto w-[65%] animate-float [animation-duration:5s]">
                  <img
                    src={currentBadge.image || '/placeholder.svg'}
                    alt={currentBadge.name}
                    className=" rounded-full object-cover animate-wiggle [animation-duration:3s] shadow-[0_30px_20px_-10px_rgba(100,100,10,0.15)]"
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    {currentBadge.description}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code - right */}
            <div className="mx-auto flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNonce?.nonce}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-4 rounded-lg border-2 border-primary cursor-default relative flex items-center justify-center"
                  onClick={e => e.preventDefault()}
                  onKeyDown={e => e.preventDefault()}
                  tabIndex={-1}
                  aria-label="QR Code for claiming POV badge"
                >
                  {claimUrl ? (
                    <>
                      <QRCode
                        value={claimUrl}
                        size={200}
                        className="block md:hidden"
                      />
                      <QRCode
                        value={claimUrl}
                        size={400}
                        className="hidden md:block lg:hidden"
                      />
                      <QRCode
                        value={claimUrl}
                        size={400}
                        className="hidden lg:block"
                      />
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No badge selected
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Claimers - 2 rows with "more" avatar */}
          <div className="bg-white/50 rounded-lg p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase flex items-center">
                <Users className="h-4 w-4 mr-1" /> Recent Claims
              </h3>
              <a
                className="text-xs text-muted-foreground hover:underline"
                href={`https://badges.page/a/${currentBadge.naddr}`}
                target="_blank"
              >
                {claimers.length} total
              </a>
            </div>

            {claimers.length === 0 ? (
              <div className="text-center py-2 text-sm text-muted-foreground">
                No claims yet. Be the first to claim your badge!
              </div>
            ) : (
              <div className="relative h-auto w-full">
                <div className="flex gap-4 overflow-x-auto relative">
                  <AnimatePresence initial={false}>
                    {displayClaimers.slice(0, 12).map((claimer, index) => {
                      // Check if this is the newest claimer
                      const isNewClaimer = index === 0

                      return (
                        <motion.div
                          key={`${claimer.id}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                            delay: isNewClaimer ? 0 : 0
                          }}
                          className="relative flex items-center justify-center flex-shrink-0"
                        >
                          <img
                            src={claimer.claim?.image || '/placeholder.svg'}
                            alt={claimer.claim?.displayName || 'User'}
                            className="h-8 w-8 md:h-16 md:w-16 rounded-full object-contain border-2 border-white"
                            title={claimer.claim?.displayName}
                            onError={e => {
                              e.currentTarget.src = '/placeholder.svg'
                            }}
                          />
                          {isNewClaimer && (
                            <motion.div
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute top-0 right-0 bg-primary rounded-full p-0.5"
                            >
                              <CheckCircle className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}

                    {/* Remaining claimers */}
                    {displayClaimers.slice(12).map((claimer, index) => (
                      <motion.div
                        key={`${claimer.id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30
                        }}
                        className="relative flex items-center justify-center flex-shrink-0"
                      >
                        <img
                          src={claimer.claim?.image || '/placeholder.svg'}
                          alt={claimer.claim?.displayName || 'User'}
                          className="h-8 w-8 md:h-16 md:w-16 rounded-full object-contain border-2 border-white"
                          title={claimer.claim?.displayName}
                          onError={e => {
                            e.currentTarget.src = '/placeholder.svg'
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Test buttons */}
          <div className="flex gap-2 justify-center">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? 'Copied!' : 'Copy URL'}
            </Button> */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={openClaimUrl}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test URL
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={simulateClaim}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <User className="h-4 w-4 mr-2" />
              Simulate Claim
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground flex flex-col">
          <div>Display this QR code at your event for attendees to scan</div>
          <div className="mt-6">
            <Button
              variant={'link'}
              className="text-xs"
              onClick={() => clearStorage()}
            >
              Clear Sorage
            </Button>
            <Button
              variant={'link'}
              className="text-xs"
              onClick={() => window.open(claimUrl, '_blank')}
            >
              Claim
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
