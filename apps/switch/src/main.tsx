import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/noto-sans-sc'
import '@fontsource-variable/jetbrains-mono'
import { AppProviders } from '@/app/providers'
import '@/i18n'
import '@/styles/index.css'

const userAgent = navigator.userAgent
document.documentElement.dataset.os = /Windows/.test(userAgent)
  ? 'windows'
  : /Mac OS X|Macintosh/.test(userAgent)
    ? 'macos'
    : 'other'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Missing root element')
}

createRoot(root).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
)
