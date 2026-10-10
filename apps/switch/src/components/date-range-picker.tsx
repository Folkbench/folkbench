import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { motion, useReducedMotion } from 'motion/react'
import { enUS, zhCN } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import Calendar01Icon from '@hugeicons/core-free-icons/Calendar01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { normalizeLocale } from '@/i18n/config'
import {
  clampSpan,
  localIsoDate,
  spanForDays,
  type DateSpan,
} from '@/lib/usage'

const PRESETS = [1, 3, 7, 14, 30] as const
const presetSpring = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 32,
  mass: 0.4,
}

function parseIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
}

function formatDay(date: Date, locale: typeof enUS) {
  return format(date, locale === zhCN ? 'PPP' : 'LLL dd, y', { locale })
}

function DateRangeField({
  value,
  min,
  max,
  onChange,
}: {
  value: DateSpan
  min: string
  max: string
  onChange: (span: DateSpan) => void
}) {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const locale = normalizeLocale(i18n.resolvedLanguage) === 'zh' ? zhCN : enUS
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()
  const from = parseIso(value.start)
  const to = parseIso(value.end)
  const selected = draft ?? { from, to }
  const custom = !PRESETS.some((count) => {
    const preset = clampSpan(spanForDays(count, max), min, max)
    return preset.start === value.start && preset.end === value.end
  })
  const rangeLabel =
    value.start === value.end
      ? formatDay(from, locale)
      : `${formatDay(from, locale)} - ${formatDay(to, locale)}`

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <div
        className="switch-segmented usage-range"
        role="group"
        aria-label={t('usage.range.label')}
      >
        {PRESETS.map((count) => {
          const preset = clampSpan(spanForDays(count, max), min, max)
          const pressed =
            preset.start === value.start && preset.end === value.end
          return (
            <motion.button
              key={count}
              type="button"
              aria-pressed={pressed}
              className="relative"
              initial="rest"
              animate={pressed ? 'pressed' : 'rest'}
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              variants={{
                rest: { y: 0, scale: 1 },
                hover: { y: -1, scale: 1.02 },
                pressed: { y: 0, scale: 1 },
              }}
              transition={presetSpring}
              onClick={() => {
                setDraft(undefined)
                setOpen(false)
                onChange(preset)
              }}
            >
              <motion.span
                data-hover-wash=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[var(--radius-md)] bg-card"
                variants={{
                  rest: { opacity: 0 },
                  hover: { opacity: pressed ? 0 : 1 },
                  pressed: { opacity: 0 },
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.16, ease: 'easeOut' }
                }
              />
              {pressed ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : 'usage-range-selection'}
                  className="pointer-events-none absolute inset-0 rounded-[var(--radius-md)] bg-card shadow-[0_0_0_1px_var(--border)]"
                  transition={reduceMotion ? { duration: 0 } : presetSpring}
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-[1]">
                {count === 1
                  ? t('usage.range.day')
                  : t('usage.range.days', { count })}
              </span>
            </motion.button>
          )
        })}
      </div>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          setDraft(undefined)
        }}
      >
        <PopoverTrigger
          aria-pressed={custom}
          aria-label={t('usage.range.custom')}
          render={
            <Button
              variant="outline"
              id="usage-date"
              className="h-11 justify-start px-3 font-normal"
            />
          }
        >
          <HugeiconsIcon
            icon={Calendar01Icon}
            strokeWidth={1.7}
            aria-hidden="true"
          />
          <span className="tabular-nums">{rangeLabel}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={(_range, triggerDate) => {
              if (!draft?.from || draft.to) {
                setDraft({ from: triggerDate, to: undefined })
                return
              }
              const start = draft.from <= triggerDate ? draft.from : triggerDate
              const end = draft.from <= triggerDate ? triggerDate : draft.from
              setDraft(undefined)
              onChange({
                start: localIsoDate(start),
                end: localIsoDate(end),
              })
              setOpen(false)
            }}
            numberOfMonths={2}
            showOutsideDays={false}
            defaultMonth={from}
            locale={locale}
            disabled={{ before: parseIso(min), after: parseIso(max) }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateRangeField }
