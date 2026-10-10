import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Usage-page refresh control with Motion hover / press / loading states. */
export function UsageRefreshButton({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean
  onRefresh: () => void
}) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const interactive = !refreshing && !reduceMotion

  return (
    <motion.button
      type="button"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'cursor-pointer'
      )}
      disabled={refreshing}
      aria-busy={refreshing}
      onClick={onRefresh}
      whileHover={interactive ? { y: -1, scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 520, damping: 28, mass: 0.35 }}
    >
      <motion.span
        className="inline-flex"
        animate={
          refreshing && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
        }
        transition={
          refreshing && !reduceMotion
            ? { repeat: Infinity, duration: 0.85, ease: 'linear' }
            : { duration: 0 }
        }
        aria-hidden="true"
      >
        <HugeiconsIcon icon={Refresh01Icon} strokeWidth={1.7} />
      </motion.span>
      {t('common.actions.refresh')}
    </motion.button>
  )
}
