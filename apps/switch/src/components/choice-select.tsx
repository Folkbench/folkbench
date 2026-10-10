import { useId, type ReactNode } from 'react'
import { Select } from '@base-ui/react/select'
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon'
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { StationAvatar } from '@/components/station-avatar'
import { Label } from '@/components/ui/label'

export type ChoiceOption<T extends string> = {
  value: T
  label: string
  avatar?: {
    name: string
    path?: string | null
    origin: string
  } | null
}

/** A shared, keyboard-accessible in-app selector; never an OS popup. */
export function ChoiceSelect<T extends string>({
  label,
  labelAccessory,
  value,
  options,
  hint,
  hideLabel = false,
  onChange,
}: {
  label: string
  labelAccessory?: ReactNode
  value: T
  options: Array<ChoiceOption<T>>
  hint?: string
  hideLabel?: boolean
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <div className="grid min-w-0 gap-1.5">
      <div
        className={
          hideLabel
            ? 'sr-only'
            : 'flex min-w-0 items-center gap-1'
        }
      >
        <Label id={id}>{label}</Label>
        {labelAccessory}
      </div>
      <Select.Root<T>
        value={value}
        items={options}
        onValueChange={(next) => {
          if (next !== null) onChange(next)
        }}
      >
        <Select.Trigger
          aria-labelledby={id}
          className="flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-input bg-card px-3 text-left text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Select.Value className="flex min-w-0 items-center gap-2">
            {(selected) => {
              const option = options.find((item) => item.value === selected)
              if (!option) return null
              return <ChoiceOptionLabel option={option} />
            }}
          </Select.Value>
          <Select.Icon>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4 text-muted-foreground"
              strokeWidth={1.7}
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            sideOffset={6}
            alignItemWithTrigger={false}
            className="z-50 outline-none"
          >
            <Select.Popup className="min-w-[var(--anchor-width)] max-w-[calc(100vw-32px)] rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[var(--shadow-overlay)]">
              <Select.List className="max-h-72 overflow-y-auto">
                {options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md py-2 pr-3 pl-8 text-[13px] outline-none data-highlighted:bg-muted data-selected:text-brand-signal"
                  >
                    <Select.ItemIndicator className="absolute left-2">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-4"
                        strokeWidth={1.7}
                      />
                    </Select.ItemIndicator>
                    <ChoiceOptionLabel option={option} itemText />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {hint ? (
        <p className="text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function ChoiceOptionLabel<T extends string>({
  option,
  itemText = false,
}: {
  option: ChoiceOption<T>
  itemText?: boolean
}) {
  const mark = option.avatar ? (
    <StationAvatar
      name={option.avatar.name}
      avatarPath={option.avatar.path}
      origin={option.avatar.origin}
      className="size-4 rounded-[4px] text-[8px]"
    />
  ) : null
  const label = itemText ? (
    <Select.ItemText className="truncate">{option.label}</Select.ItemText>
  ) : (
    <span className="truncate">{option.label}</span>
  )
  return (
    <span className="flex min-w-0 items-center gap-2">
      {mark}
      {label}
    </span>
  )
}
