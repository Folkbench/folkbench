import Activity02Icon from '@hugeicons/core-free-icons/Activity02Icon'
import Analytics02Icon from '@hugeicons/core-free-icons/Analytics02Icon'
import ArrowTurnBackwardIcon from '@hugeicons/core-free-icons/ArrowTurnBackwardIcon'
import Configuration01Icon from '@hugeicons/core-free-icons/Configuration01Icon'
import Key02Icon from '@hugeicons/core-free-icons/Key02Icon'
import Shield01Icon from '@hugeicons/core-free-icons/Shield01Icon'
import TransactionHistoryIcon from '@hugeicons/core-free-icons/TransactionHistoryIcon'
import Wallet01Icon from '@hugeicons/core-free-icons/Wallet01Icon'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

type PreviewKind =
  | 'tools'
  | 'account'
  | 'apiKeys'
  | 'usage'
  | 'preview'
  | 'rollback'
  | 'history'
  | 'privacy'

interface ShowcasePanel {
  id: string
  eyebrow: string
  status: string
  title: string
  description: string
  icon: IconSvgElement
  preview: PreviewKind
}

interface ShowcaseLaneProps {
  panels: ShowcasePanel[]
  position: 'top' | 'bottom'
}

function ShowcasePreview({ kind }: { kind: PreviewKind }) {
  const { t } = useTranslation()

  switch (kind) {
    case 'tools':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {['Codex', 'Claude Code', 'Gemini CLI', 'Grok Build'].map((tool) => (
            <div
              key={tool}
              className="flex min-w-0 items-center justify-between gap-2 rounded-md border bg-muted/45 px-2 py-1.5"
            >
              <span className="truncate text-[0.6875rem] font-medium">
                {tool}
              </span>
              <span className="size-1.5 shrink-0 rounded-full bg-brand-signal" />
            </div>
          ))}
        </div>
      )

    case 'account':
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {[
            t('signIn.showcase.account.balance'),
            t('signIn.showcase.account.usage'),
            t('signIn.showcase.account.keys'),
          ].map((label, index) => (
            <div
              key={label}
              className="flex min-w-0 flex-col gap-2 rounded-md border bg-muted/45 p-2"
            >
              <span className="truncate font-mono text-[0.625rem] tracking-[0.05em] text-muted-foreground uppercase">
                {label}
              </span>
              <span
                className={cn(
                  'h-1 rounded-full bg-foreground/35',
                  index === 0 ? 'w-4/5' : index === 1 ? 'w-3/5' : 'w-2/5'
                )}
              />
            </div>
          ))}
        </div>
      )

    case 'apiKeys':
      return (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/45 px-2.5 py-2">
          <code className="truncate text-[0.6875rem] text-muted-foreground">
            mf_••••••••••••
          </code>
          <span className="shrink-0 font-mono text-[0.625rem] tracking-[0.06em] text-brand-signal uppercase">
            {t('signIn.showcase.apiKeys.masked')}
          </span>
        </div>
      )

    case 'usage':
      return (
        <div className="flex flex-col gap-1.5">
          {[
            t('signIn.showcase.usage.requests'),
            t('signIn.showcase.usage.tokens'),
            t('signIn.showcase.usage.cost'),
          ].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-[0.6875rem] text-muted-foreground">
                {label}
              </span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    'block h-full rounded-full bg-foreground/35',
                    index === 0 ? 'w-4/5' : index === 1 ? 'w-3/5' : 'w-2/5'
                  )}
                />
              </span>
            </div>
          ))}
        </div>
      )

    case 'preview':
      return (
        <div className="overflow-hidden rounded-md border bg-background/80 font-mono text-[0.625rem] leading-relaxed">
          <div className="bg-destructive/10 px-2 py-1 text-destructive">
            − provider = &quot;previous&quot;
          </div>
          <div className="bg-brand-signal/10 px-2 py-1 text-brand-signal">
            + provider = &quot;example-relay&quot;
          </div>
          <div className="px-2 py-1 text-muted-foreground">
            {t('signIn.showcase.preview.preserved')}
          </div>
        </div>
      )

    case 'rollback':
      return (
        <div className="grid grid-cols-3 gap-1.5">
          {[
            t('signIn.showcase.rollback.inspect'),
            t('signIn.showcase.rollback.preview'),
            t('signIn.showcase.rollback.restore'),
          ].map((label, index) => (
            <div
              key={label}
              className={cn(
                'rounded-md border bg-muted/45 px-1 py-2 text-center font-mono text-[0.625rem] tracking-[0.04em] uppercase',
                index === 1 && 'border-brand-signal/35 text-brand-signal'
              )}
            >
              {label}
            </div>
          ))}
        </div>
      )

    case 'history':
      return (
        <div className="flex flex-col gap-1.5">
          {[
            t('signIn.showcase.history.inspected'),
            t('signIn.showcase.history.applied'),
            t('signIn.showcase.history.verified'),
          ].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  index === 2 ? 'bg-brand-signal' : 'bg-foreground/30'
                )}
              />
              <span className="text-[0.6875rem] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      )

    case 'privacy':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[
            t('signIn.showcase.privacy.local'),
            t('signIn.showcase.privacy.noPrompts'),
          ].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-md border bg-muted/45 px-2 py-2 text-[0.6875rem] text-muted-foreground"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-brand-signal" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      )
  }
}

function ShowcaseCard({ panel }: { panel: ShowcasePanel }) {
  return (
    <article className="mf-sign-in-feature-card flex min-h-40 w-72 shrink-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex min-h-10 items-center justify-between gap-3 border-b px-3">
        <div className="flex min-w-0 items-center gap-2">
          <HugeiconsIcon
            icon={panel.icon}
            size={14}
            className="shrink-0 text-muted-foreground"
          />
          <span className="truncate font-mono text-[0.625rem] tracking-[0.08em] text-muted-foreground uppercase">
            {panel.eyebrow}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.05em] text-muted-foreground uppercase">
          <span className="size-1.5 rounded-full bg-brand-signal" />
          {panel.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-[0.8125rem] leading-snug font-semibold">
            {panel.title}
          </h2>
          <p className="m-0 text-[0.6875rem] leading-relaxed text-muted-foreground">
            {panel.description}
          </p>
        </div>
        <div className="mt-auto">
          <ShowcasePreview kind={panel.preview} />
        </div>
      </div>
    </article>
  )
}

function ShowcaseLane({ panels, position }: ShowcaseLaneProps) {
  return (
    <div className={`mf-sign-in-lane mf-sign-in-lane-${position}`}>
      <div className="mf-sign-in-track">
        {[0, 1].map((copy) => (
          <div className="mf-sign-in-set" key={copy}>
            {panels.map((panel) => (
              <ShowcaseCard key={`${copy}-${panel.id}`} panel={panel} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SignInBackdrop() {
  const { t } = useTranslation()

  const topPanels: ShowcasePanel[] = [
    {
      id: 'tools',
      eyebrow: t('signIn.showcase.tools.eyebrow'),
      status: t('signIn.showcase.tools.status'),
      title: t('signIn.showcase.tools.title'),
      description: t('signIn.showcase.tools.description'),
      icon: Configuration01Icon,
      preview: 'tools',
    },
    {
      id: 'account',
      eyebrow: t('signIn.showcase.account.eyebrow'),
      status: t('signIn.showcase.account.status'),
      title: t('signIn.showcase.account.title'),
      description: t('signIn.showcase.account.description'),
      icon: Wallet01Icon,
      preview: 'account',
    },
    {
      id: 'api-keys',
      eyebrow: t('signIn.showcase.apiKeys.eyebrow'),
      status: t('signIn.showcase.apiKeys.status'),
      title: t('signIn.showcase.apiKeys.title'),
      description: t('signIn.showcase.apiKeys.description'),
      icon: Key02Icon,
      preview: 'apiKeys',
    },
    {
      id: 'usage',
      eyebrow: t('signIn.showcase.usage.eyebrow'),
      status: t('signIn.showcase.usage.status'),
      title: t('signIn.showcase.usage.title'),
      description: t('signIn.showcase.usage.description'),
      icon: Analytics02Icon,
      preview: 'usage',
    },
  ]

  const bottomPanels: ShowcasePanel[] = [
    {
      id: 'preview',
      eyebrow: t('signIn.showcase.preview.eyebrow'),
      status: t('signIn.showcase.preview.status'),
      title: t('signIn.showcase.preview.title'),
      description: t('signIn.showcase.preview.description'),
      icon: TransactionHistoryIcon,
      preview: 'preview',
    },
    {
      id: 'rollback',
      eyebrow: t('signIn.showcase.rollback.eyebrow'),
      status: t('signIn.showcase.rollback.status'),
      title: t('signIn.showcase.rollback.title'),
      description: t('signIn.showcase.rollback.description'),
      icon: ArrowTurnBackwardIcon,
      preview: 'rollback',
    },
    {
      id: 'history',
      eyebrow: t('signIn.showcase.history.eyebrow'),
      status: t('signIn.showcase.history.status'),
      title: t('signIn.showcase.history.title'),
      description: t('signIn.showcase.history.description'),
      icon: Activity02Icon,
      preview: 'history',
    },
    {
      id: 'privacy',
      eyebrow: t('signIn.showcase.privacy.eyebrow'),
      status: t('signIn.showcase.privacy.status'),
      title: t('signIn.showcase.privacy.title'),
      description: t('signIn.showcase.privacy.description'),
      icon: Shield01Icon,
      preview: 'privacy',
    },
  ]

  return (
    <div className="mf-sign-in-showcase" aria-hidden="true">
      <ShowcaseLane panels={topPanels} position="top" />
      <ShowcaseLane panels={bottomPanels} position="bottom" />
      <div className="mf-sign-in-center-shield" />
    </div>
  )
}
