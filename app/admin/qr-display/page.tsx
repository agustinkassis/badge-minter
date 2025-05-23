'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  User,
  Users,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminMint } from '@/hooks/use-admin-mint'
import { BadgeAward } from '@/types/badge'

const mockBadge = {
  id: 'mock',
  name: 'Mock Badge',
  description: 'A mock badge for testing',
  image: '/placeholder.svg',
  pubkey: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
  naddr: 'naddr1mock'
}

// Mock user profiles for simulation
const mockUsers: BadgeAward[] = [
  {
    id: '1',
    claim: {
      displayName: 'Sarah Johnson',
      image: '/colorful-profile-avatar.png',
      pubkey:
        'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      nip05: 'sarahjohnson@example.com'
    },
    pubkey: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    event: {
      id: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      pubkey:
        'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      created_at: 1715808000,
      kind: 1,
      content: 'Hello, world!',
      tags: [],
      sig: ''
    },
    badge: mockBadge
  }
]

export default function QRDisplayPage() {
  const router = useRouter()
  const [currentNonce, setCurrentNonce] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [claimUrl, setClaimUrl] = useState('')
  const [claimers, setClaimers] = useState<BadgeAward[]>([])
  const { toast } = useToast()
  const MAX_VISIBLE_CLAIMERS = 16
  const nonceRefreshInterval = useRef<NodeJS.Timeout | null>(null)
  const NONCE_REFRESH_INTERVAL = 2000 // 2 seconds

  const { isAuthenticated, currentBadge } = useNostrAdmin()

  const onNewAward = useCallback(
    async (award: BadgeAward) => {
      console.info('New award:', award)
      setClaimers(prev => [...prev, award])

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
    // eslint-disable-line react-hooks/exhaustive-deps
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
      setClaimUrl(
        currentBadge
          ? `${window.location.origin}/claim?nonce=${currentNonce}&naddr=${currentBadge.naddr}`
          : ''
      )
    }
  }, [currentNonce, currentBadge])

  // Function to refresh the nonce
  const refreshNonce = () => {
    // Generate a new nonce
    const newNonce = generateNonce()
    setCurrentNonce(newNonce)
  }

  // Copy claim URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(claimUrl).then(
      () => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      },
      err => {
        console.error('Could not copy text: ', err)
      }
    )
  }

  // Open claim URL in new tab
  const openClaimUrl = () => {
    router.push(claimUrl)
  }

  // Simulate a POV claim
  const simulateClaim = () => {
    // Get users that haven't claimed yet
    const availableUsers = mockUsers.filter(
      user => !claimers.some(claimer => claimer.id === user.id)
    )

    // If all users have claimed, start over
    const userPool = availableUsers.length > 0 ? availableUsers : mockUsers

    // Select a random user from the available users
    const randomUser = userPool[Math.floor(Math.random() * userPool.length)]

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
    setClaimers(prev => [
      ...prev,
      { ...randomUser, timestamp: new Date().toISOString() }
    ])
  }

  // Calculate how many claimers to display and how many are hidden
  const visibleClaimers = claimers.slice(-MAX_VISIBLE_CLAIMERS)
  const hiddenClaimersCount = Math.max(
    0,
    claimers.length - MAX_VISIBLE_CLAIMERS
  )

  // If we have more than MAX_VISIBLE_CLAIMERS, we need to show MAX_VISIBLE_CLAIMERS - 1 avatars
  // plus the "more" avatar
  const displayClaimers =
    hiddenClaimersCount > 0
      ? visibleClaimers.slice(0, MAX_VISIBLE_CLAIMERS - 1)
      : visibleClaimers

  if (!currentBadge) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="container relative flex min-h-screen flex-col px-4 py-10">
      {/* Toast notifications */}
      <Toaster />

      {/* Decorative elements */}
      <div
        className="flamingo flamingo-2 animate-float"
        style={{ animationDelay: '-2s' }}
      ></div>
      <div className="lightning lightning-1 animate-pulse"></div>

      <Link
        href="/admin/select-badge"
        className="mb-6 flex items-center text-sm font-bold text-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        BACK TO POV SELECTION
      </Link>

      <Card className="card-mint border-none mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black tracking-tight text-primary">
            SCAN TO MINT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* POV Display - At the top */}
          <div
            onClick={() =>
              window.open(
                `https://badges.page/a/${currentBadge.naddr}`,
                '_blank'
              )
            }
            role="link"
            tabIndex={0}
            className="rounded-lg bg-white/50 p-4 hover:bg-white/80 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={currentBadge.image || '/placeholder.svg'}
                alt={currentBadge.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="text-left">
                <h3 className="font-bold uppercase">{currentBadge.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {currentBadge.description}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code with Nonce Refresh */}
          <div className="mx-auto flex h-64 w-64 flex-col items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNonce}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-lg border-2 border-primary cursor-default relative"
                onClick={e => e.preventDefault()}
                onKeyDown={e => e.preventDefault()}
                tabIndex={-1}
                aria-label="QR Code for claiming POV badge"
              >
                {claimUrl ? (
                  <QRCode value={claimUrl} size={200} />
                ) : (
                  <div className="text-center text-muted-foreground">
                    No badge selected
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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
                No claims yet. Use the &quot;Simulate Claim&quot; button to
                test.
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-8 gap-1 relative">
                  <AnimatePresence initial={false}>
                    {displayClaimers.map((claimer, index) => {
                      // Check if this is the newest claimer
                      const isNewClaimer =
                        index === displayClaimers.length - 1 &&
                        hiddenClaimersCount === 0 &&
                        index === claimers.length - 1

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
                          className="relative flex items-center justify-center"
                        >
                          <img
                            src={claimer.claim?.image || '/placeholder.svg'}
                            alt={claimer.claim?.displayName || 'User'}
                            className="h-8 w-8 rounded-full object-cover border-2 border-white"
                            title={claimer.claim?.displayName}
                          />
                          {isNewClaimer && (
                            <motion.div
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5"
                            >
                              <CheckCircle className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}

                    {/* "More" avatar for hidden claimers */}
                    {hiddenClaimersCount > 0 && (
                      <motion.div
                        key="more-avatar"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30
                        }}
                        className="relative flex items-center justify-center"
                      >
                        <div
                          className="h-8 w-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors"
                          title={`${hiddenClaimersCount} more claimers`}
                        >
                          <span className="text-xs font-bold text-primary flex items-center">
                            <Plus className="h-3 w-3" />
                            {hiddenClaimersCount}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Test buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copySuccess ? 'Copied!' : 'Copy URL'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openClaimUrl}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Test URL
            </Button>
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
        <CardFooter className="text-center text-xs text-muted-foreground">
          Display this QR code at your event for attendees to scan
        </CardFooter>
      </Card>
    </div>
  )
}
