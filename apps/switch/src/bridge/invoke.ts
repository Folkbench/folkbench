import { invoke } from '@tauri-apps/api/core'

import type { ServiceError } from '@/bridge/generated/myService'

/**
 * Stable codes the UI can render. Raw Rust, runtime, or serialization detail
 * never reaches the WebView surface.
 */
export const BRIDGE_ERROR = {
  desktopUnavailable: 'desktopUnavailable',
  commandFailed: 'commandFailed',
} as const

const SERVICE_ERRORS = [
  'invalidInput',
  'notFound',
  'locationUnavailable',
  'writeFailed',
  'credentialMissing',
  'toolUnknown',
  'applyUnsupported',
  'inUse',
  'driftDetected',
] as const satisfies readonly ServiceError[]

export type BridgeErrorCode = (typeof BRIDGE_ERROR)[keyof typeof BRIDGE_ERROR]

export class BridgeError extends Error {
  readonly code: BridgeErrorCode
  readonly serviceError?: ServiceError

  constructor(code: BridgeErrorCode, serviceError?: ServiceError) {
    super(serviceError ?? code)
    this.name = 'BridgeError'
    this.code = code
    this.serviceError = serviceError
  }
}

function desktopRuntimeAvailable() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function asServiceError(value: unknown): ServiceError | undefined {
  if (
    typeof value === 'string' &&
    (SERVICE_ERRORS as readonly string[]).includes(value)
  ) {
    return value as ServiceError
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if ('message' in record) return asServiceError(record.message)
    if ('error' in record) return asServiceError(record.error)
  }
  return undefined
}

/**
 * The only place the application calls Tauri. Every command goes through this
 * wrapper so a missing runtime and a failing command are both reported as
 * codes the UI knows how to render.
 */
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (!desktopRuntimeAvailable()) {
    throw new BridgeError(BRIDGE_ERROR.desktopUnavailable)
  }

  try {
    return await invoke<T>(command, args)
  } catch (error) {
    const serviceError = asServiceError(error)
    throw new BridgeError(BRIDGE_ERROR.commandFailed, serviceError)
  }
}
