import { useEffect, useState } from 'react'

import { resolveCatalogAssetSrc } from '@/lib/catalog-assets'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) || '?').toUpperCase()
}

export function StationAvatar({
  name,
  avatarPath,
  origin,
  className,
}: {
  name: string
  avatarPath?: string | null
  origin: string
  className?: string
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setImageSrc(null)
    setImageReady(false)
    setImageFailed(false)

    if (!avatarPath) return

    void resolveCatalogAssetSrc(avatarPath, origin)
      .then((url) => {
        if (!cancelled) setImageSrc(url)
      })
      .catch(() => {
        if (!cancelled) setImageFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [avatarPath, origin])

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-muted text-[11px] font-semibold text-muted-foreground',
        className
      )}
    >
      <span className="col-start-1 row-start-1">{initials(name)}</span>
      {imageSrc && !imageFailed ? (
        <img
          src={imageSrc}
          alt=""
          draggable={false}
          className={cn(
            'col-start-1 row-start-1 size-full object-cover transition-opacity duration-150',
            imageReady ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageReady(true)}
          onError={() => {
            setImageFailed(true)
            setImageReady(false)
          }}
        />
      ) : null}
    </span>
  )
}
