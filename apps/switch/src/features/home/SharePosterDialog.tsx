import { useQuery } from '@tanstack/react-query'
import { useLayoutEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { copyShareImage, saveShareImage } from '@/bridge'
import mark from '@/assets/brand/folkbench-logo-only.svg'
import { toolMark } from '@/components/tool-logo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  blobBase64,
  canvasPngBlob,
  drawSharePoster,
  POSTER_WIDTH,
  posterFileName,
} from '@/features/home/share-poster'
import { sessionQueryOptions } from '@/features/session/queries'
import {
  displayListPrice,
  grainKey,
} from '@/lib/usage'
import type { UsageWindow } from '@/lib/usage'

type Summary = {
  toolId: string
  toolName: string
  usage: UsageWindow
}

export function SharePosterDialog({
  summary,
  locale,
  onClose,
}: {
  summary: Summary | null
  locale: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const session = useQuery(sessionQueryOptions)
  const userName =
    session.data?.user?.displayName?.trim() ||
    session.data?.user?.email?.trim() ||
    t('usage.share.guestName')
  // Stamp the card once per opened summary, like a screenshot time.
  const generatedAt = useMemo(() => new Date(), [summary])
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [drawnKey, setDrawnKey] = useState('')
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState<'copy' | 'save' | null>(null)
  const buckets = summary?.usage.buckets ?? []
  const canDraw = buckets.length > 0
  const amount = displayListPrice(summary?.usage.referencePriceUsd ?? null)
  const posterKey = summary
    ? [
        summary.toolId,
        summary.toolName,
        summary.usage.dayCount,
        summary.usage.grain,
        summary.usage.tokens,
        amount ?? '',
        buckets.map((bucket) => bucket.date).join(','),
        locale,
        userName,
        generatedAt.getTime(),
      ].join('|')
    : ''
  const ready = posterKey !== '' && drawnKey === posterKey && !failed

  const input = useMemo(() => {
    if (!summary || !canDraw) return null
    return {
      brandSrc: mark,
      mark: toolMark(summary.toolId),
      toolName: summary.toolName,
      brandName: t('common.product.shortName'),
      userName,
      generatedAt,
      hero: new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(Math.round(summary.usage.tokens)),
      unit: '',
      amount: amount ? t('usage.listPrice.amount', { amount }) : null,
    }
  }, [
    amount,
    buckets,
    canDraw,
    generatedAt,
    locale,
    posterKey,
    summary,
    t,
    userName,
  ])

  useLayoutEffect(() => {
    // The dialog portal mounts this canvas on a later commit. The node
    // itself is a dependency so drawing starts only after that commit.
    if (!summary || !input || !canvas) return
    let cancelled = false
    setFailed(false)
    void drawSharePoster(canvas, input).then(
      () => {
        if (!cancelled) setDrawnKey(posterKey)
      },
      () => {
        if (!cancelled) setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [canvas, input, posterKey, summary])

  async function onCopyText() {
    if (!summary) return
    const tokens = new Intl.NumberFormat(locale).format(summary.usage.tokens)
    const copy = amount
      ? t('usage.share.copyWithEstimate', {
          tool: summary.toolName,
          tokens,
          amount,
        })
      : t('usage.share.copyTokensOnly', {
          tool: summary.toolName,
          tokens,
        })
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard')
      await navigator.clipboard.writeText(copy)
      toast.success(t('usage.share.copied'))
    } catch {
      toast.error(t('usage.share.copyUnavailable'))
    }
  }

  async function onCopyImage() {
    if (!canvas || !ready) return
    setBusy('copy')
    try {
      const blob = await canvasPngBlob(canvas)
      if ('__TAURI_INTERNALS__' in window) {
        await copyShareImage(await blobBase64(blob))
      } else if (
        typeof ClipboardItem !== 'undefined' &&
        navigator.clipboard?.write
      ) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
      } else {
        throw new Error('clipboard')
      }
      toast.success(t('usage.share.copyImageDone'))
    } catch {
      toast.error(t('usage.share.imageUnavailable'))
    } finally {
      setBusy(null)
    }
  }

  async function onSaveImage() {
    if (!canvas || !ready || !summary) return
    setBusy('save')
    try {
      const blob = await canvasPngBlob(canvas)
      const fileName = posterFileName(summary.toolId, summary.usage.dayCount)
      if ('__TAURI_INTERNALS__' in window) {
        await saveShareImage(await blobBase64(blob), fileName)
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        URL.revokeObjectURL(url)
      }
      toast.success(t('usage.share.saveImageDone'))
    } catch {
      toast.error(t('usage.share.imageUnavailable'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog
      open={summary !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[30rem]">
        <DialogHeader>
          <DialogTitle>{t('usage.share.title')}</DialogTitle>
        </DialogHeader>
        {canDraw ? (
          <div className="overflow-hidden rounded-2xl bg-[#09090C]">
            <canvas
              ref={setCanvas}
              width={POSTER_WIDTH}
              height={620}
              aria-label={t('usage.share.posterLabel', {
                tool: summary?.toolName ?? '',
                grain: summary ? t(grainKey(summary.usage.grain)) : '',
              })}
              className="block h-auto w-full"
            />
          </div>
        ) : null}
        {failed ? (
          <p
            className="text-center text-[13px] text-muted-foreground"
            role="alert"
          >
            {t('usage.share.imageUnavailable')}
          </p>
        ) : null}
        <div className="grid gap-2">
          <Button
            type="button"
            disabled={!ready || busy !== null}
            onClick={() => void onCopyImage()}
          >
            {t('usage.share.copyImage')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!ready || busy !== null}
            onClick={() => void onSaveImage()}
          >
            {t('usage.share.saveImage')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy !== null}
            onClick={() => void onCopyText()}
          >
            {t('usage.share.copy')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
