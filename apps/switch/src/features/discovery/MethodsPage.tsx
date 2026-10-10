import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

export function MethodsPage() {
  const { t } = useTranslation()

  return (
    <div className="switch-workspace">
      <Link
        to="/discover"
        search={{ modelId: DEFAULT_PUBLIC_MODEL_ID }}
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
      <div className="overflow-hidden rounded-xl border bg-card text-[13px]">
        <section className="px-4 py-4">
          <h2 className="font-medium">{t('discovery.methods.rankingTitle')}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('discovery.methods.rankingBody')}
          </p>
        </section>
        <section className="border-t px-4 py-4">
          <h2 className="font-medium">{t('discovery.methods.hostTitle')}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('discovery.methods.hostBody')}
          </p>
        </section>
        <section className="border-t px-4 py-4">
          <h2 className="font-medium">{t('discovery.methods.keyTitle')}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('discovery.methods.keyBody')}
          </p>
        </section>
      </div>
    </div>
  )
}
