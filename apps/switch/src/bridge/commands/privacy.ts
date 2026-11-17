import type {
  PrivacyMaskPreview,
  PrivacySettings,
  PrivacyStatus,
} from '@/bridge/generated/privacy'
import { invokeCommand } from '@/bridge/invoke'

export async function getPrivacyStatus(): Promise<PrivacyStatus> {
  return invokeCommand<PrivacyStatus>('get_privacy_status')
}

export async function savePrivacySettings(
  settings: PrivacySettings
): Promise<PrivacyStatus> {
  return invokeCommand<PrivacyStatus>('save_privacy_settings', { settings })
}

export async function previewPrivacyMasking(
  text: string,
  settings?: PrivacySettings
): Promise<PrivacyMaskPreview> {
  return invokeCommand<PrivacyMaskPreview>('preview_privacy_masking', {
    text,
    settings: settings ?? null,
  })
}
