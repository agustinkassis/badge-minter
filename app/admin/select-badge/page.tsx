'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ArrowLeft, BadgeCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useNostrAdmin } from '@/contexts/nostr-admin-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useProfile } from 'nostr-hooks'
import { motion } from 'framer-motion'

// Mock data for POV tokens - would be fetched from Nostr in real implementation
const mockBadges = [
  {
    id: '1',
    name: 'Event Attendee',
    description: 'Attended our awesome event',
    image: '/colorful-event-badges.png'
  },
  {
    id: '2',
    name: 'VIP Access',
    description: 'VIP access to all areas',
    image: '/colorful-vip-badge.png'
  },
  {
    id: '3',
    name: 'Workshop Participant',
    description: 'Participated in our workshop',
    image: '/colorful-badge-workshop.png'
  },
  {
    id: '4',
    name: 'Speaker',
    description: 'Spoke at our conference',
    image: '/colorful-badge-speaker.png'
  },
  {
    id: '5',
    name: 'Hackathon Winner',
    description: 'Won our hackathon challenge',
    image: '/colorful-winner-badge.png'
  },
  {
    id: '6',
    name: 'Community Member',
    description: 'Active community participant',
    image: '/colorful-badge-community.png'
  }
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
}

const profileVariants = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
}

export default function SelectPOVPage() {
  const router = useRouter()
  const {
    isAuthenticated,
    publicKey,
    npubAddress,
    error: adminError
  } = useNostrAdmin()
  const [badges, setBadges] = useState<any[]>([])
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const { profile } = useProfile({ pubkey: publicKey || '' })

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !publicKey) {
      router.push('/admin/setup')
      return
    }

    // Fetch user profile and badges
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // In a real implementation, we would fetch the user's badges from Nostr
        setBadges(mockBadges)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, publicKey, npubAddress, router])

  // Set error from context
  useEffect(() => {
    if (adminError) {
      setError(adminError)
    }
  }, [adminError])

  const handleContinue = () => {
    if (selectedBadge) {
      router.push(`/admin/qr-display?badgeId=${selectedBadge}`)
    }
  }

  return (
    <div className="container relative flex min-h-screen flex-col px-4 py-10">
      {/* Decorative elements */}
      <div className="flamingo flamingo-1 animate-float"></div>
      <div
        className="flamingo flamingo-3 animate-float"
        style={{ animationDelay: '-3s' }}
      ></div>
      <div className="lightning lightning-2 animate-pulse"></div>

      <Link
        href="/admin/setup"
        className="mb-6 flex items-center text-sm font-bold text-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        BACK TO SETUP
      </Link>

      <div className="space-y-6 w-full max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {/* User Profile Card */}
        <motion.div initial="hidden" animate="show" variants={profileVariants}>
          <Card className="card-lavender border-none">
            <CardContent className="flex items-center gap-4 p-6">
              <motion.div
                className="flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <img
                  src={profile?.picture || '/colorful-profile-avatar.png'}
                  alt={profile?.displayName || 'User'}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white"
                />
              </motion.div>
              <div>
                <motion.h2
                  className="text-xl font-black tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {profile?.displayName || 'Loading...'}
                </motion.h2>
                <motion.p
                  className="text-sm text-white/80 truncate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {npubAddress || 'Loading...'}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* POV Selection Card */}
        <Card className="card-mint border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight text-primary">
              SELECT Badge
            </CardTitle>
            <CardDescription>
              Choose one of your proof of visit badges to distribute at the
              event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">
                  Loading your POV badges...
                </p>
              </div>
            ) : badges.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-40 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    No badges found for your account
                  </p>
                  <p className="text-sm">
                    Create your first badge to get started!
                  </p>
                </div>
                <a
                  href="https://badges.page/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button className="btn-pill bg-primary text-white hover:bg-primary/90">
                    CREATE A BADGE ON BADGES.PAGE
                  </Button>
                </a>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Badges.page is a platform for creating and managing Nostr
                  badges
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      variants={badgeVariants}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-white/50 ${
                        selectedBadge === badge.id
                          ? 'border-primary bg-white/50'
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedBadge(badge.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          className="mb-3 overflow-hidden rounded-full bg-white/70 p-2"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: 0.1 * index + 0.2,
                            duration: 0.5
                          }}
                        >
                          <img
                            src={badge.image || '/placeholder.svg'}
                            alt={badge.name}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                        </motion.div>
                        <h3 className="font-bold uppercase">{badge.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                        {selectedBadge === badge.id && (
                          <motion.div
                            className="mt-2 text-primary"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 15
                            }}
                          >
                            <BadgeCheck className="h-6 w-6 mx-auto" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex justify-end pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleContinue}
                      disabled={!selectedBadge}
                      className="btn-pill bg-primary text-white hover:bg-primary/90"
                    >
                      CONTINUE TO QR DISPLAY
                    </Button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
