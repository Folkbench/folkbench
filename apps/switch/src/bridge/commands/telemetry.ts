import { invokeCommand } from '@/bridge/invoke'
export type TelemetryStatus = { enabled: boolean; queuedEvents: number }
export async function prepareUpdateTelemetry(targetVersion: string | null) {
  try {
    await invokeCommand<void>('prepare_update_telemetry', { targetVersion })
  } catch {
    /* Optional statistics must not block installing an update. */
  }
}
export function getTelemetryStatus() {
  return invokeCommand<TelemetryStatus>('get_telemetry_status')
}
export function setTelemetryEnabled(enabled: boolean) {
  return invokeCommand<TelemetryStatus>('set_telemetry_enabled', { enabled })
}
export function recordUpdateTelemetry(
  name: 'update_check' | 'update_download' | 'update_install',
  success: boolean,
  targetVersion?: string
) {
  void invokeCommand<void>('record_update_telemetry', {
    name,
    success,
    targetVersion: targetVersion ?? null,
  }).catch(() => undefined)
}
