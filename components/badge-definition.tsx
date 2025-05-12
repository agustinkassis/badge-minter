import { BadgeDefinition as BadgeDefinitionType } from '@/types/badge'
import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'

export interface BadgeDefinitionProps {
  badge: BadgeDefinitionType
  isSelected: boolean
  setSelectedBadge: (badge: BadgeDefinitionType) => void
  index: number
}

export function BadgeDefinition({
  badge,
  isSelected,
  setSelectedBadge,
  index
}: BadgeDefinitionProps) {
  return (
    <motion.div
      key={badge.id}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-white/50 ${
        isSelected ? 'border-primary bg-white/50' : 'border-transparent'
      }`}
      onClick={() => setSelectedBadge(badge)}
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
        {isSelected && (
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
  )
}
