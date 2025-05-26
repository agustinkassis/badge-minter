'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { nip19 } from 'nostr-tools'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CheckCircle, Share2, Trophy, Star, Award } from 'lucide-react'
import Link from 'next/link'
import { useNostrUser } from '@/contexts/nostr-user-context'
import { Footer } from '@/components/footer'

export default function SuccessPage() {
  const [error, setError] = useState<string | null>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const [showBadge, setShowBadge] = useState(false)
  const { currentBadge } = useNostrUser()
  const searchParams = useSearchParams()
  const npub = searchParams.get('npub')

  useEffect(() => {
    if (!currentBadge) {
      return
    }

    // Trigger animations with slight delays
    setTimeout(() => {
      setShowBadge(true)
      launchConfetti()
    }, 500)

    setTimeout(() => {
      setAnimationComplete(true)
    }, 2000)
  }, [currentBadge])

  const launchConfetti = () => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then(confetti => {
        const canvas = confettiCanvasRef.current
        if (canvas) {
          const myConfetti = confetti.create(canvas, { resize: true })

          // First burst
          myConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })

          // Second burst after a delay
          setTimeout(() => {
            myConfetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 }
            })
          }, 250)

          // Third burst after another delay
          setTimeout(() => {
            myConfetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 }
            })
          }, 400)
        }
      })
    }
  }

  const badgesProfileUrl = `https://badges.page/p/${npub}`
  const badgesPageUrl = `https://badges.page/a/${currentBadge?.naddr}`

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `I received a ${currentBadge?.name || 'Nostr'} POV badge!`,
          text: `Check out my new ${currentBadge?.name || 'Nostr'} proof of visit!`,
          url: badgesPageUrl
        })
        .catch(error => console.log('Error sharing', error))
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard
        .writeText(badgesPageUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err))
    }
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
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentBadge) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="container relative flex min-h-screen flex-col px-4 py-10 overflow-hidden">
      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Decorative elements */}
      <div
        className="flamingo flamingo-2 animate-float"
        style={{ animationDelay: '-2s' }}
      ></div>
      <div
        className="flamingo flamingo-3 animate-float"
        style={{ animationDelay: '-4s' }}
      ></div>
      <div className="lightning lightning-1 animate-pulse"></div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div
          className="absolute top-[20%] left-[15%] text-primary animate-float"
          style={{ animationDelay: '-1s' }}
        >
          <Trophy className="h-8 w-8 opacity-50" />
        </div>
        <div
          className="absolute top-[30%] right-[20%] text-accent animate-float"
          style={{ animationDelay: '-3s' }}
        >
          <Star className="h-10 w-10 opacity-50" />
        </div>
        <div
          className="absolute bottom-[25%] left-[25%] text-secondary animate-float"
          style={{ animationDelay: '-2s' }}
        >
          <Award className="h-12 w-12 opacity-50" />
        </div>
        <div
          className="absolute bottom-[35%] right-[15%] text-primary animate-float"
          style={{ animationDelay: '-4s' }}
        >
          <Star className="h-6 w-6 opacity-50" />
        </div>
      </div>

      <Card className="card-yellow border-none mx-auto w-full max-w-md relative z-20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CheckCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-primary animate-bounce">
            CONGRATULATIONS!
          </CardTitle>
          <CardDescription className="font-bold">
            You&apos;ve received your POV badge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex flex-col items-center justify-center">
            <div
              className={`bg-white/50 p-3 rounded-full mb-3 transition-all duration-1000 ease-out ${
                showBadge
                  ? 'opacity-100 transform scale-100'
                  : 'opacity-0 transform scale-0'
              }`}
            >
              <img
                src={currentBadge.image || '/placeholder.svg'}
                alt={currentBadge.name}
                className={`h-24 w-24 rounded-full object-cover transition-all duration-700 ${
                  animationComplete ? 'animate-pulse' : ''
                }`}
              />

              {/* Animated rings */}
              <div
                className={`absolute inset-0 rounded-full border-4 border-primary/30 ${
                  showBadge ? 'animate-ping' : 'opacity-0'
                }`}
                style={{ animationDuration: '1.5s' }}
              ></div>

              <div
                className={`absolute inset-0 rounded-full border-2 border-accent/50 ${
                  showBadge ? 'animate-ping' : 'opacity-0'
                }`}
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              ></div>
            </div>

            <h3
              className={`font-bold uppercase transition-all duration-700 ${
                showBadge
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              {currentBadge.name}
            </h3>

            <p
              className={`text-sm text-muted-foreground transition-all duration-700 ${
                showBadge
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-4'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {currentBadge.description}
            </p>
          </div>

          <div
            className={`space-y-3 transition-all duration-700 ${
              animationComplete
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <Link
              href={badgesProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full btn-pill border-primary text-primary hover:bg-primary/10"
              >
                OPEN YOUR BADGES.PAGE
              </Button>
            </Link>

            <Button
              onClick={handleShare}
              className="w-full btn-pill bg-primary text-white hover:bg-primary/90"
            >
              <Share2 className="mr-2 h-4 w-4" />
              SHARE YOUR BADGE
            </Button>
          </div>
        </CardContent>
      </Card>

      <Footer />
    </div>
  )
}
