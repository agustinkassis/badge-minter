/**
 * A service to manage nonces for secure QR code generation
 * Nonces are short-lived tokens that expire after a set time
 */

// Type definition for a nonce entry
type NonceEntry = {
  value: string
  createdAt: number // timestamp
  expiresAt: number // timestamp
}

class NonceService {
  private nonces: Map<string, NonceEntry> = new Map()
  private readonly EXPIRY_TIME = 120 * 1000 // 120 seconds in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Start the cleanup interval when the service is instantiated
    this.startCleanupInterval()
  }

  /**
   * Generate a new nonce
   * @returns The generated nonce value
   */
  generateNonce(): string {
    // Generate a random string for the nonce
    const nonceValue =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)

    const now = Date.now()
    const expiresAt = now + this.EXPIRY_TIME

    // Store the nonce with its expiration time
    this.nonces.set(nonceValue, {
      value: nonceValue,
      createdAt: now,
      expiresAt: expiresAt
    })

    return nonceValue
  }

  /**
   * Verify if a nonce is valid and not expired
   * @param nonce The nonce to verify
   * @returns True if the nonce is valid, false otherwise
   */
  verifyNonce(nonce: string): boolean {
    const nonceEntry = this.nonces.get(nonce)

    if (!nonceEntry) {
      return false // Nonce doesn't exist
    }

    const now = Date.now()

    if (now > nonceEntry.expiresAt) {
      // Nonce has expired, remove it
      this.nonces.delete(nonce)
      return false
    }

    return true
  }

  /**
   * Get the remaining time for a nonce in seconds
   * @param nonce The nonce to check
   * @returns Remaining time in seconds, or 0 if expired/invalid
   */
  getRemainingTime(nonce: string): number {
    const nonceEntry = this.nonces.get(nonce)

    if (!nonceEntry) {
      return 0
    }

    const now = Date.now()
    const remaining = nonceEntry.expiresAt - now

    return Math.max(0, Math.floor(remaining / 1000))
  }

  /**
   * Clean up expired nonces
   */
  cleanupExpiredNonces(): void {
    const now = Date.now()

    for (const [key, nonceEntry] of this.nonces.entries()) {
      if (now > nonceEntry.expiresAt) {
        this.nonces.delete(key)
      }
    }
  }

  /**
   * Start the cleanup interval
   */
  private startCleanupInterval(): void {
    // Clean up expired nonces every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredNonces()
    }, 30000)
  }

  /**
   * Stop the cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Create a singleton instance
const nonceService = new NonceService()

export default nonceService
