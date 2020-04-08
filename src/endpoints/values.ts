import { HTTPContext, isObject, withJSON, withStatus } from '../common/helpers'
import { validateValueUpdate } from '../validators/valueUpdate'
import { KVNamespace } from '@cloudflare/workers-types'

export async function getValues(context: HTTPContext) {
  if (!context.query) {
    return new Response(null, withStatus(400))
  }

  const env = context.query.get('env')
  const ns = context.query.get('ns')
  const values: any = (await VALUES.get(`${context.user.sub}-${env}-${ns}`, 'json')) || {}

  return new Response(JSON.stringify(values), withJSON(200))
}

export interface SelectorValue {
  label: string
  value: string
}
export type FlagValue = string | number | boolean | SelectorValue

export async function updateValue(context: HTTPContext) {
  if (!validateValueUpdate(context.body)) {
    return new Response(null, withStatus(400))
  }
  const flags: Array<any> = (await FLAGS.get(context.user.sub, 'json')) || []
  const flag = flags.find(f => f.id === context.body.id)

  const data: Array<any[] | null> = await Promise.all([
    ENVIRONMENTS.get(context.user.sub, 'json'),
    NAMESPACES.get(context.user.sub, 'json')
  ])
  const environments = data[0] || []
  const namespaces = data[1] || []

  const value: FlagValue = context.body.value

  const opStatus = await updateResolvers(
    context.user.sub,
    context.body.environment,
    context.body.namespace,
    context.body.id,
    value,
    flag.active,
    true,
    environments,
    namespaces,
    flag
  )

  if (!opStatus) {
    return new Response(null, withStatus(404))
  }

  return new Response(null, withStatus(204))
}

function segmentValue(value: any) {
  if (value === 100) {
    return 'B'
  }

  return 'A'
}

export async function updateResolvers(
  user: string,
  env: string,
  ns: string,
  id: string,
  value: FlagValue | null,
  active: boolean,
  updateValue: boolean,
  environments: Array<any>,
  namespaces: Array<any>,
  flag: any
): Promise<boolean> {
  const account = user
  const environment: any = environments.find(e => e.id === env)
  const namespace: any = namespaces.find(n => n.id === ns)
  if (!environment || !namespace) {
    return false
  }

  await Promise.all([
    // Update Values
    ...(updateValue ? [updateKV(VALUES, `${user}-${env}-${ns}`, id, value, false)] : []),

    // Update Resolver (by account, env and ns)
    updateKV(
      RESOLVER,
      `${account}-${env}-${ns}`,
      id,
      active && value !== null ? (flag.type === 'segment' ? segmentValue(value) : value) : null,
      true
    ),
    // Update Resolver (by account, origin and ns)
    ...environment.origins.map((origin: string) =>
      RESOLVER.put(`${account}-${origin}-${ns}`, environment.id)
    ),
    // Update Segment if flag.type = 'segment'
    ...(flag.type === 'segment'
      ? [
          updateKV(
            SEGMENTS,
            `${account}-${env}-${ns}`,
            id,
            value === 0 || value === 100 ? null : value,
            false
          )
        ]
      : [])
  ])

  return true
}

async function updateKV(
  table: KVNamespace,
  key: string,
  id: string,
  value: FlagValue | null,
  isResolver: boolean
): Promise<void> {
  const values: any = (await table.get(key, 'json')) || {}
  if (value === null) {
    delete values[id]
  } else if (isObject(value) && isResolver) {
    const flagSelector: SelectorValue = <SelectorValue>value
    values[id] = flagSelector.value
  } else {
    values[id] = value
  }

  if (Object.keys(values).length === 0) {
    await table.delete(key)
  } else {
    await table.put(key, JSON.stringify(values))
  }
}
