import { BadgeAward } from '@/types/badge'
import useLocalStorage from './use-local-storage'

export interface UseClaimersReturn {
  claimers: BadgeAward[]
  addClaimer: (award: BadgeAward) => void
  claimerExists: (pubkey: string) => boolean
  clearClaimers: () => void
}

export const useClaimers = (naddr: string): UseClaimersReturn => {
  const [claimers, setClaimers] = useLocalStorage<BadgeAward[]>(naddr || '', [])

  const addClaimer = (award: BadgeAward) => {
    if (naddr === '') {
      console.error('No naddr provided')
      return
    }
    setClaimers(prev => [...prev, award])
  }

  const claimerExists = (pubkey: string) => {
    return claimers.some(claimer => claimer.pubkey === pubkey)
  }

  const clearClaimers = () => {
    setClaimers([])
  }

  return {
    claimers,
    addClaimer,
    claimerExists,
    clearClaimers
  }
}
