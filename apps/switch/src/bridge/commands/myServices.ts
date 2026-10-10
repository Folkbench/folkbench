import type {
  MyService,
  ServiceProtocol,
  SwitchResult,
  ServiceBalance,
  VerifyResult,
} from '@/bridge/generated/myService'
import type { ToolDescriptor } from '@/bridge/generated/bootstrap'
import { invokeCommand } from '@/bridge/invoke'

export async function listMyServices(toolId: string): Promise<MyService[]> {
  return invokeCommand<MyService[]>('list_my_services', { toolId })
}

export async function getMyServiceCredential(
  toolId: string,
  serviceId: string
): Promise<string | null> {
  return invokeCommand<string | null>('get_my_service_credential', {
    toolId,
    serviceId,
  })
}

export async function addMyService(input: {
  toolId: string
  name: string
  stationId: string
  channelId: string
  modelId: string
  apiProtocol: ServiceProtocol
  baseUrl: string
  apiKey: string
}): Promise<MyService> {
  return invokeCommand<MyService>('add_my_service', input)
}

export async function removeMyService(
  toolId: string,
  serviceId: string
): Promise<void> {
  await invokeCommand<null>('remove_my_service', { toolId, serviceId })
}

export async function updateMyService(input: {
  toolId: string
  serviceId: string
  name: string
  stationId: string
  channelId: string
  modelId: string
  apiProtocol: ServiceProtocol
  baseUrl: string
  apiKey?: string
}): Promise<MyService> {
  return invokeCommand<MyService>('update_my_service', input)
}

export async function switchMyService(
  toolId: string,
  serviceId: string
): Promise<SwitchResult> {
  return invokeCommand<SwitchResult>('switch_my_service', { toolId, serviceId })
}

export async function unswitchMyService(toolId: string): Promise<SwitchResult> {
  return invokeCommand<SwitchResult>('unswitch_my_service', { toolId })
}

export async function rollbackMyServiceSwitch(
  toolId: string
): Promise<SwitchResult> {
  return invokeCommand<SwitchResult>('rollback_my_service_switch', { toolId })
}

export async function verifyMyService(
  toolId: string,
  serviceId: string
): Promise<VerifyResult> {
  return invokeCommand<VerifyResult>('verify_my_service', { toolId, serviceId })
}

export async function queryServiceBalance(
  toolId: string,
  serviceId: string
): Promise<ServiceBalance> {
  return invokeCommand<ServiceBalance>('query_service_balance', {
    toolId,
    serviceId,
  })
}

export async function listSwitchTools(): Promise<ToolDescriptor[]> {
  return invokeCommand<ToolDescriptor[]>('list_switch_tools')
}

export async function importMyServiceFromLive(
  toolId: string
): Promise<MyService> {
  return invokeCommand<MyService>('import_my_service_from_live', { toolId })
}

export type MyServiceImportStatus = 'missing' | 'synced' | 'changed'

export async function getMyServiceImportStatus(
  toolId: string
): Promise<MyServiceImportStatus> {
  return invokeCommand<MyServiceImportStatus>('get_my_service_import_status', {
    toolId,
  })
}
