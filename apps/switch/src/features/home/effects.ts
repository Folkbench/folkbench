import type { SwitchEffect, ToolDescriptor } from '@/bridge'

export const DEFAULT_TOOL_ID = 'claude-code'

export function effectForTool(
  toolId: string,
  fromCatalog?: SwitchEffect
): SwitchEffect {
  return fromCatalog ?? 'notImplemented'
}

export function switcherTools(tools: ToolDescriptor[]): ToolDescriptor[] {
  const ready = tools.filter((tool) => tool.switchEffect !== 'notImplemented')
  return ready.length > 0 ? ready : tools
}

export function resolveToolId(
  lastToolId: string | null,
  tools: ToolDescriptor[]
): string {
  const list = switcherTools(tools)
  if (lastToolId && list.some((tool) => tool.id === lastToolId)) {
    return lastToolId
  }
  if (list.some((tool) => tool.id === DEFAULT_TOOL_ID)) {
    return DEFAULT_TOOL_ID
  }
  return list[0]?.id ?? DEFAULT_TOOL_ID
}
