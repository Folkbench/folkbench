import LanguagesIcon from '@hugeicons/core-free-icons/LanguagesIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import type { SupportedLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  value: SupportedLocale
  onSelect: (locale: SupportedLocale) => void
  disabled?: boolean
  className?: string
}

/**
 * Presentation only. The owning screen supplies the stored value and performs
 * the write, so this stays usable before and after authentication.
 */
export function LanguageSwitcher({
  value,
  onSelect,
  disabled,
  className,
}: LanguageSwitcherProps) {
  const { t } = useTranslation()

  const labels: Record<SupportedLocale, string> = {
    en: t('settings.language.options.en'),
    zh: t('settings.language.options.zh'),
  }
  const nextLocale: SupportedLocale = value === 'en' ? 'zh' : 'en'

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      aria-label={t('settings.language.switchTo', {
        language: labels[nextLocale],
      })}
      onClick={() => {
        onSelect(nextLocale)
      }}
      className={cn('gap-2 bg-card text-xs text-muted-foreground', className)}
    >
      <HugeiconsIcon icon={LanguagesIcon} size={14} />
      {labels[nextLocale]}
    </Button>
  )
}
