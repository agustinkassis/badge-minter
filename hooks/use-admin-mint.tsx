import { useState } from 'react'
import { NonceService } from '@/lib/nonce-service'

export interface UseAdminMintProps {}

export interface UseAdminMintReturn {
  generateNonce: () => string
  burnNonce: (nonce: string) => boolean
}

export const useAdminMint = (): UseAdminMintReturn => {
  //   const { currentBadge } = useNostrAdmin()
  const [nonceService] = useState(() => new NonceService())

  const generateNonce = () => {
    return nonceService.generateNonce()
  }

  const burnNonce = (nonce: string) => {
    return nonceService.verifyNonce(nonce)
  }

  return { generateNonce, burnNonce }
}
