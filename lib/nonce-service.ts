import { sha256 } from '@noble/hashes/sha2.js'

export class NonceService {
  private randomSalt: string

  constructor() {
    this.randomSalt = Buffer.from(
      crypto.getRandomValues(new Uint8Array(16))
    ).toString('hex')
  }

  generateNonce(naddr: string = '', time: number): string {
    // Generate a random string for the nonce

    const nonceValue = Buffer.from(
      sha256(Buffer.from(`${time}${naddr}${this.randomSalt}`))
    ).toString('hex')

    console.info('Generating nonce for', naddr, 'and time', time)
    console.info('Random salt', this.randomSalt)
    console.info('naddr', naddr)
    console.info('time', time)
    console.info('nonce', nonceValue)

    return nonceValue
  }

  verifyNonce(nonce: string, naddr: string, time: number): boolean {
    const correctNonce = this.generateNonce(naddr, time)
    console.info('randomSalt', this.randomSalt)
    console.info('naddr', naddr)
    console.info('time', time)

    console.info('Nonce to verify', nonce)
    console.info('Correct nonce', correctNonce)

    return nonce === correctNonce
  }
}
