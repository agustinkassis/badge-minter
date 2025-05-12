'use client'

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
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  User,
  Users,
  Plus,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import nonceService from '@/lib/nonce-service'

// Mock user profiles for simulation
const mockUsers = [
  {
    id: '1',
    displayName: 'Sarah Johnson',
    username: 'sarahjohnson',
    picture: '/colorful-profile-avatar.png',
    npub: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '2',
    displayName: 'Alex Rivera',
    username: 'alexrivera',
    picture: '/placeholder.svg?key=j3y8t',
    npub: 'npub2abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '3',
    displayName: 'Jamie Smith',
    username: 'jamiesmith',
    picture: '/profile-avatar-hat.png',
    npub: 'npub3abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '4',
    displayName: 'Taylor Wong',
    username: 'taylorwong',
    picture: '/placeholder.svg?key=p39sj',
    npub: 'npub4abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '5',
    displayName: 'Jordan Lee',
    username: 'jordanlee',
    picture: '/profile-avatar-sunglasses.png',
    npub: 'npub5abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '6',
    displayName: 'Casey Kim',
    username: 'caseykim',
    picture: '/profile-avatar-beanie.png',
    npub: 'npub6abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '7',
    displayName: 'Morgan Chen',
    username: 'morganchen',
    picture: '/profile-avatar-curly.png',
    npub: 'npub7abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '8',
    displayName: 'Riley Patel',
    username: 'rileypatel',
    picture: '/profile-avatar-cap.png',
    npub: 'npub8abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '9',
    displayName: 'Quinn Davis',
    username: 'quinndavis',
    picture: '/placeholder.svg?key=q7d9f',
    npub: 'npub9abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '10',
    displayName: 'Avery Martinez',
    username: 'averymartinez',
    picture: '/placeholder.svg?key=a5m2z',
    npub: 'npub10abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '11',
    displayName: 'Blake Thompson',
    username: 'blakethompson',
    picture: '/placeholder.svg?key=b8t3p',
    npub: 'npub11abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '12',
    displayName: 'Cameron Wright',
    username: 'cameronwright',
    picture: '/placeholder.svg?key=c4w7t',
    npub: 'npub12abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '13',
    displayName: 'Dakota Green',
    username: 'dakotagreen',
    picture: '/placeholder.svg?key=d2g6n',
    npub: 'npub13abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '14',
    displayName: 'Emerson Brown',
    username: 'emersonbrown',
    picture: '/placeholder.svg?key=e9b1n',
    npub: 'npub14abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '15',
    displayName: 'Finley Adams',
    username: 'finleyadams',
    picture: '/placeholder.svg?key=f3a8s',
    npub: 'npub15abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '16',
    displayName: 'Gray Wilson',
    username: 'graywilson',
    picture: '/placeholder.svg?key=g5w2n',
    npub: 'npub16abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '17',
    displayName: 'Harper Evans',
    username: 'harperevans',
    picture: '/placeholder.svg?key=h7e4s',
    npub: 'npub17abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '18',
    displayName: 'Indigo Clark',
    username: 'indigoclark',
    picture: '/placeholder.svg?key=i1c9k',
    npub: 'npub18abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '19',
    displayName: 'Jordan Baker',
    username: 'jordanbaker',
    picture: '/placeholder.svg?key=j6b3r',
    npub: 'npub19abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  },
  {
    id: '20',
    displayName: 'Kai Nelson',
    username: 'kainelson',
    picture: '/placeholder.svg?key=k2n7n',
    npub: 'npub20abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
  }
]

export default function QRDisplayPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useNostrAdmin()
  const [currentNonce, setCurrentNonce] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [claimers, setClaimers] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const MAX_VISIBLE_CLAIMERS = 15
  const nonceRefreshInterval = useRef<NodeJS.Timeout | null>(null)
  const NONCE_REFRESH_INTERVAL = 2000 // 2 seconds

  const { currentBadge } = useNostrAdmin()

  // Find the selected POV token
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
      // Stop the nonce service cleanup interval
      nonceService.stopCleanupInterval()
    }
  }, [])

  // Function to refresh the nonce
  const refreshNonce = () => {
    setIsRefreshing(true)

    // Generate a new nonce
    const newNonce = nonceService.generateNonce()
    setCurrentNonce(newNonce)

    // Reset refreshing state after a short delay for animation
    setTimeout(() => {
      setIsRefreshing(false)
    }, 300)
  }

  // Generate the claim URL with the current nonce
  const claimUrl = `${window.location.origin}/claim?token=${currentNonce}`

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
      title: 'POV Badge Claimed!',
      description: (
        <div className="flex items-center gap-2">
          <img
            src={randomUser.picture || '/placeholder.svg'}
            alt={randomUser.displayName}
            className="h-8 w-8 rounded-full"
          />
          <div>
            <p className="font-bold">{randomUser.displayName}</p>
            <p className="text-xs opacity-80">@{randomUser.username}</p>
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

  // Calculate remaining time for the current nonce
  const remainingTime = nonceService.getRemainingTime(currentNonce)

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
          <CardDescription className="uppercase font-bold">
            {currentBadge.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {/* POV Display - At the top */}
          <div className="rounded-lg bg-white/50 p-4">
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
                transition={{ duration: 0.3 }}
                className="bg-white p-4 rounded-lg border-2 border-primary cursor-default relative"
                onClick={e => e.preventDefault()}
                onKeyDown={e => e.preventDefault()}
                tabIndex={-1}
                aria-label="QR Code for claiming POV token"
              >
                <QRCode value={claimUrl} size={200} />

                {/* Refreshing indicator */}
                {isRefreshing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nonce info */}
            <div className="mt-2 text-xs text-muted-foreground">
              QR code refreshes automatically to prevent farming
            </div>
          </div>

          {/* Recent Claimers - 2 rows with "more" avatar */}
          <div className="bg-white/50 rounded-lg p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase flex items-center">
                <Users className="h-4 w-4 mr-1" /> Recent Claims
              </h3>
              <span className="text-xs text-muted-foreground">
                {claimers.length} total
              </span>
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
                          key={`${claimer.id}-${claimer.timestamp}`}
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
                            src={claimer.picture || '/placeholder.svg'}
                            alt={claimer.displayName || 'User'}
                            className="h-8 w-8 rounded-full object-cover border-2 border-white"
                            title={claimer.displayName}
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
                            <Plus className="h-3 w-3 mr-0.5" />
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
