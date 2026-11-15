import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

const METHOD_SECTIONS = [
  {
    titleKey: 'discovery.methods.rankingTitle',
    bodyKey: 'discovery.methods.rankingBody',
  },
  {
    titleKey: 'discovery.methods.securityTitle',
    bodyKey: 'discovery.methods.securityBody',
  },
  {
    titleKey: 'discovery.methods.integrityTitle',
    bodyKey: 'discovery.methods.integrityBody',
  },
  {
    titleKey: 'discovery.methods.frontierTitle',
    bodyKey: 'discovery.methods.frontierBody',
  },
  {
    titleKey: 'discovery.methods.cacheTitle',
    bodyKey: 'discovery.methods.cacheBody',
  },
  {
    titleKey: 'discovery.methods.compareTitle',
    bodyKey: 'discovery.methods.compareBody',
  },
  {
    titleKey: 'discovery.methods.hostTitle',
    bodyKey: 'discovery.methods.hostBody',
  },
  {
    titleKey: 'discovery.methods.keyTitle',
    bodyKey: 'discovery.methods.keyBody',
  },
] as const

export function MethodsPage() {
  const { t } = useTranslation()

  return (
    <div className="switch-workspace">
      <Link
        to="/discover"
        search={{
          modelId: DEFAULT_PUBLIC_MODEL_ID,
          tab: 'rankings',
          metric: 'availability',
        }}
        className="w-fit text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('discovery.detail.back')}
      </Link>
      <div>
        <h1 className="switch-page-title">{t('discovery.methods.title')}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {t('discovery.methods.description')}
        </p>
      </div>
      <div className="fbd-panel divide-y text-[13px]">
        {METHOD_SECTIONS.map((section) => (
          <section key={section.titleKey} className="px-4 py-4">
            <h2 className="font-medium text-foreground">
              {t(section.titleKey)}
            </h2>
            <p className="mt-1 text-muted-foreground">{t(section.bodyKey)}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
