import { createRoute } from '@tanstack/react-router'

import { HomePage } from '@/features/home/HomePage'
import { consoleRoute } from '@/routes/console'

export type HomeSearch = {
  add?: boolean
  stationId?: string
  channelId?: string
  modelId?: string
  stationName?: string
  channelName?: string
  returnStationId?: string
  returnChannelId?: string
  returnModelId?: string
}

function optionalText(value: unknown) {
  return typeof value === 'string' && value.length <= 120 && value.trim()
    ? value
    : undefined
}

export const homeRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    add: search.add === true || search.add === 'true' ? true : undefined,
    stationId: optionalText(search.stationId),
    channelId: optionalText(search.channelId),
    modelId: optionalText(search.modelId),
    stationName: optionalText(search.stationName),
    channelName: optionalText(search.channelName),
    returnStationId: optionalText(search.returnStationId),
    returnChannelId: optionalText(search.returnChannelId),
    returnModelId: optionalText(search.returnModelId),
  }),
  component: HomePage,
})
