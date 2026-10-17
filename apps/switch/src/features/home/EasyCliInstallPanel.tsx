import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  isEasyCliInstallActive,
  type EasyCliInstallJob,
} from './easy-cli-install'

const PHASE_KEYS = {
  checking: 'easy.installPhase.checking',
  downloading: 'easy.installPhase.downloading',
  installing: 'easy.installPhase.installing',
} as const

function phaseLabel(
  t: (key: (typeof PHASE_KEYS)[keyof typeof PHASE_KEYS]) => string,
  phase: keyof typeof PHASE_KEYS,
) {
  return t(PHASE_KEYS[phase])
}

const ACTIVE_STEPS = ['checking', 'downloading', 'installing'] as const

type Props = {
  job: EasyCliInstallJob
  /** Dismiss via 完成 / 关闭 — OS title-bar X is the cancel path while running. */
  onRequestClose: () => void
  onRequestRetry?: () => void
}

/**
 * Body UI for the secondary install WebviewWindow.
 * Progress has no in-body Close; use the OS caption button (or Esc) to cancel.
 */
export function EasyCliInstallPanel({
  job,
  onRequestClose,
  onRequestRetry,
}: Props) {
  const { t } = useTranslation()
  const active = isEasyCliInstallActive(job.phase)

  return (
    <div
      className="easy-install-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="easy-install-title"
    >
      <div className="easy-install-panel__card">
        {active ? (
          <>
            <div className="easy-install-panel__visual" aria-hidden="true">
              <span className="easy-spinner easy-spinner--lg" />
            </div>
            <h2 id="easy-install-title" className="easy-install-panel__phase">
              {phaseLabel(t, job.phase as keyof typeof PHASE_KEYS)}
            </h2>
            <p className="easy-install-panel__subtitle">
              {t('easy.installPanelSubtitle', { tool: job.cliLabel })}
            </p>
            <ol className="easy-install-panel__steps">
              {ACTIVE_STEPS.map((step) => {
                const idx = ACTIVE_STEPS.indexOf(step)
                const current = ACTIVE_STEPS.indexOf(
                  job.phase as (typeof ACTIVE_STEPS)[number],
                )
                const done = current > idx
                const now = job.phase === step
                return (
                  <li
                    key={step}
                    className={
                      done ? 'is-done' : now ? 'is-current' : 'is-pending'
                    }
                  >
                    <span className="easy-install-panel__dot" />
                    {phaseLabel(t, step)}
                  </li>
                )
              })}
            </ol>
            <p className="easy-install-panel__hint">
              {t('easy.installPanelHint')}
            </p>
          </>
        ) : null}

        {job.phase === 'success' ? (
          <div className="easy-install-panel__result is-success" role="status">
            <h2 id="easy-install-title" className="easy-install-panel__result-title">
              {t('easy.installSuccessTitle', { tool: job.cliLabel })}
            </h2>
            <p className="easy-install-panel__result-body">
              {t('easy.installSuccessBody')}
            </p>
            <div className="easy-install-panel__actions">
              <Button type="button" onClick={onRequestClose}>
                {t('easy.installPanelDone')}
              </Button>
            </div>
          </div>
        ) : null}

        {job.phase === 'failure' ? (
          <div className="easy-install-panel__result is-failure" role="alert">
            <h2 id="easy-install-title" className="easy-install-panel__result-title">
              {t('easy.installFailureTitle')}
            </h2>
            <p className="easy-install-panel__result-body">
              {job.error ?? t('easy.installError')}
            </p>
            <div className="easy-install-panel__actions">
              {onRequestRetry ? (
                <Button type="button" onClick={onRequestRetry}>
                  {t('easy.installPanelRetry')}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                onClick={onRequestClose}
              >
                {t('easy.installPanelClose')}
              </Button>
            </div>
          </div>
        ) : null}

        {job.phase === 'cancelled' ? (
          <div className="easy-install-panel__result" role="status">
            <h2 id="easy-install-title" className="easy-install-panel__result-title">
              {t('easy.installCancelled')}
            </h2>
            <div className="easy-install-panel__actions">
              <Button type="button" onClick={onRequestClose}>
                {t('easy.installPanelDone')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
