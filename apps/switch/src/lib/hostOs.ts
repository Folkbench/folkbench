/** Desktop OS tag written once at startup in `main.tsx`. */
export type HostOs = 'macos' | 'windows' | 'other'

export function hostOs(): HostOs {
  if (typeof document === 'undefined') return 'other'
  const os = document.documentElement.dataset.os
  if (os === 'macos' || os === 'windows') return os
  return 'other'
}

/** Usage-guide copy is only split for Mac and Windows. */
export type GuideOs = 'mac' | 'win'

export function guideOs(): GuideOs {
  return hostOs() === 'windows' ? 'win' : 'mac'
}
