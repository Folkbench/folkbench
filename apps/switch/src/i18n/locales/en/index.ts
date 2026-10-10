import apiKeys from './apiKeys.json'
import changes from './changes.json'
import common from './common.json'
import configure from './configure.json'
import discovery from './discovery.json'
import errors from './errors.json'
import navigation from './navigation.json'
import overview from './overview.json'
import settings from './settings.json'
import signIn from './signIn.json'
import tools from './tools.json'
import updates from './updates.json'
import usage from './usage.json'
import validation from './validation.json'

export const en = {
  ...apiKeys,
  ...changes,
  ...common,
  ...configure,
  ...discovery,
  ...errors,
  ...navigation,
  ...overview,
  ...settings,
  ...signIn,
  ...tools,
  ...updates,
  ...usage,
  ...validation,
} as const
