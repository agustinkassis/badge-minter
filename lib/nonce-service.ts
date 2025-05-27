import { sha256 } from '@noble/hashes/sha2.js'

export class NonceService {
  private randomSalt: string

  constructor() {
    this.randomSalt = Buffer.from(
      crypto.getRandomValues(new Uint8Array(16))
    ).toString('hex')
  }

  generateNonce(naddr: string = '', time: number): string {
    const nonceValue = Buffer.from(
      sha256(Buffer.from(`${time}${naddr}${this.randomSalt}`))
    ).toString('hex')

    return nonceValue
  }

  verifyNonce(nonce: string, naddr: string, time: number): boolean {
    const correctNonce = this.generateNonce(naddr, time)
    return nonce === correctNonce
  }
}
