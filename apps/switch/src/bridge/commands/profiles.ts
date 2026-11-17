import type {
  ApplyProfileResult,
  ProfilesSnapshot,
} from '@/bridge/generated/profiles'
import { invokeCommand } from '@/bridge/invoke'

export async function listProfiles(): Promise<ProfilesSnapshot> {
  return invokeCommand<ProfilesSnapshot>('list_profiles')
}

export async function saveProfile(
  name: string,
  id?: string | null
): Promise<ProfilesSnapshot> {
  return invokeCommand<ProfilesSnapshot>('save_profile', {
    name,
    id: id ?? null,
  })
}

export async function applyProfile(id: string): Promise<ApplyProfileResult> {
  return invokeCommand<ApplyProfileResult>('apply_profile', { id })
}

export async function renameProfile(
  id: string,
  name: string
): Promise<ProfilesSnapshot> {
  return invokeCommand<ProfilesSnapshot>('rename_profile', { id, name })
}

export async function deleteProfile(id: string): Promise<ProfilesSnapshot> {
  return invokeCommand<ProfilesSnapshot>('delete_profile', { id })
}
