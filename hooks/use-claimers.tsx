import { BadgeAward } from '@/types/badge'
import useLocalStorage from './use-local-storage'

export interface UseClaimersReturn {
  claimers: BadgeAward[]
  addClaimer: (award: BadgeAward) => void
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

  return {
    claimers,
    addClaimer
  }
}
