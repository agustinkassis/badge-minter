'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Sparkles, Zap, Award, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated circles */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-primary/5"
          initial={{ x: -100, y: -100 }}
          animate={{
            x: [-100, 50, -80],
            y: [-100, -150, -50],
            scale: [1, 1.2, 0.9]
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse'
          }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-accent/5"
          initial={{ x: 100, y: 100 }}
          animate={{
            x: [100, 50, 150],
            y: [100, 150, 50],
            scale: [1, 1.3, 0.8]
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse'
          }}
        />
        <motion.div
          className="absolute left-1/3 top-1/4 w-48 h-48 rounded-full bg-secondary/10"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            x: [-20, 30, -20],
            y: [-20, 20, -20]
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse'
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="flamingo flamingo-1 animate-float"></div>
      <div
        className="flamingo flamingo-2 animate-float"
        style={{ animationDelay: '-2s' }}
      ></div>
      <div
        className="flamingo flamingo-3 animate-float"
        style={{ animationDelay: '-4s' }}
      ></div>
      <div className="lightning lightning-1 animate-pulse"></div>
      <div
        className="lightning lightning-2 animate-pulse"
        style={{ animationDelay: '-1.5s' }}
      ></div>

      {/* Floating icons */}
      <motion.div
        className="absolute bottom-1/4 right-1/6 text-accent opacity-20"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
          delay: 1
        }}
      >
        <Star className="h-10 w-10" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-1/4 text-secondary opacity-20"
        animate={{
          y: [0, 10, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'reverse',
          delay: 2
        }}
      >
        <Zap className="h-8 w-8" />
      </motion.div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-5xl font-black tracking-tight mb-4 text-primary"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            NOS VEGAS
          </motion.h1>
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            PROOF OF VISIT
          </motion.h2>
          <motion.p
            className="text-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Distribute Nostr proofs at your events
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="card-mint border-none mb-8 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-black tracking-tight">
                WELCOME
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center pt-4">
              Just click on <b>Let&apos;s start</b> and follow the steps
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Link href="/admin/setup" className="w-full">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    className="w-full btn-pill bg-primary text-white hover:bg-primary/90 button-press-effect"
                    size="lg"
                  >
                    <div className="flex items-center justify-center">
                      <Sparkles className="mr-2 h-4 w-4" />
                      LET&apos;S START
                    </div>
                  </Button>
                </motion.div>
              </Link>
              <p className="text-sm text-center">
                For event organizers to set up and manage proof of visit tokens
              </p>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="card-yellow p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-sm font-medium">
              &quot;POV tokens are a fun way to verify attendance and build
              community!&quot;
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
