import {
  createEnvironment,
  deleteEnvironment,
  getEnvironments,
  updateEnvironment
} from './endpoints/environments'
import { HTTPHandler } from './common/helpers'
import { createAPIKey, deleteAPIKey, getAPIKeys } from './endpoints/apikeys'
import {
  createFlag,
  deleteFlag,
  deleteSelector,
  getFlags,
  getSelectors,
  updateFlag,
  updateSelector
} from './endpoints/flags'
import {
  createNamespace,
  deleteNamespace,
  getNamespaces,
  updateNamespace
} from './endpoints/namespaces'
import { updateAccount } from './endpoints/accounts'
import { getValues, updateValue } from './endpoints/values'

export const apiHandlers: { [key: string]: HTTPHandler } = {
  'GET-/environments': getEnvironments,
  'POST-/environments': createEnvironment,
  'PATCH-/environments': updateEnvironment,
  'DELETE-/environments': deleteEnvironment,

  'GET-/apikeys': getAPIKeys,
  'POST-/apikeys': createAPIKey,
  'DELETE-/apikeys': deleteAPIKey,

  'GET-/flags': getFlags,
  'POST-/flags': createFlag,
  'DELETE-/flags': deleteFlag,
  'PATCH-/flags': updateFlag,

  'POST-/flags/selectors': updateSelector,
  'GET-/flags/selectors': getSelectors,
  'DELETE-/flags/selectors': deleteSelector,

  'GET-/namespaces': getNamespaces,
  'POST-/namespaces': createNamespace,
  'PATCH-/namespaces': updateNamespace,
  'DELETE-/namespaces': deleteNamespace,

  'POST-/accounts': updateAccount,

  'GET-/values': getValues,
  'PATCH-/values': updateValue
}
