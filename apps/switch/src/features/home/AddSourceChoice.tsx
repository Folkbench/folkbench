import { useTranslation } from 'react-i18next'
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon'
import PencilEdit02Icon from '@hugeicons/core-free-icons/PencilEdit02Icon'
import Store01Icon from '@hugeicons/core-free-icons/Store01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

function SourceOption({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: typeof PencilEdit02Icon
  title: string
  hint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border bg-card px-3 py-3 text-left transition-colors duration-[var(--motion-fast)] hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      onClick={onClick}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-5 text-muted-foreground">
          {hint}
        </span>
      </span>
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        strokeWidth={1.7}
        className="shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  )
}

export function AddSourceChoice({
  onCustom,
  onStation,
}: {
  onCustom: () => void
  onStation: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-2">
      <SourceOption
        icon={PencilEdit02Icon}
        title={t('configure.addSource.custom')}
        hint={t('configure.addSource.customHint')}
        onClick={onCustom}
      />
      <SourceOption
        icon={Store01Icon}
        title={t('configure.addSource.station')}
        hint={t('configure.addSource.stationHint')}
        onClick={onStation}
      />
    </div>
  )
}
