import { HTTPContext, mergeAll, withJSON, withStatus } from '../common/helpers'
import { MAX_ENVS } from '../limits'
import { validateEnvironment } from '../validators/environment'
import { validateEnvironmentUpdate } from '../validators/environmentUpdate'

export async function getEnvironments(context: HTTPContext) {
  const environments: Array<any> = (await ENVIRONMENTS.get(context.user.sub, 'json')) || []

  return new Response(
    JSON.stringify({
      data: environments,
      slots: MAX_ENVS - environments.length
    }),
    withJSON(200)
  )
}

export async function createEnvironment(context: HTTPContext) {
  if (!validateEnvironment(context.body)) {
    return new Response(null, withStatus(400))
  }

  const environments: Array<any> = (await ENVIRONMENTS.get(context.user.sub, 'json')) || []

  const existingIndex = environments.findIndex(e => e.id === context.body.id)
  if (existingIndex >= 0) {
    environments[existingIndex] = context.body
  } else {
    if (environments.length >= MAX_ENVS) {
      return new Response(null, withStatus(412))
    }

    environments.push(context.body)
  }

  await ENVIRONMENTS.put(context.user.sub, JSON.stringify(environments))

  return new Response(null, withStatus(204))
}

export async function updateEnvironment(context: HTTPContext) {
  if (!validateEnvironmentUpdate(context.body)) {
    return new Response(null, withStatus(400))
  }

  const environments: Array<any> = (await ENVIRONMENTS.get(context.user.sub, 'json')) || []

  const existingIndex = environments.findIndex(f => f.id === context.body.id)

  if (existingIndex < 0) {
    return new Response(null, withStatus(404))
  }

  const previousEnvironmentDef = environments[existingIndex]
  environments[existingIndex] = {
    ...environments[existingIndex],
    ...context.body
  }
  const updatedOrigins = context.body.origins || previousEnvironmentDef.origins

  const deleteOrigins: Array<string> = previousEnvironmentDef.origins.filter(
    (origin: string) => !updatedOrigins.some((o: string) => o === origin)
  )
  const addOrigins: Array<string> = updatedOrigins.filter(
    (origin: string) => !previousEnvironmentDef.origins.some((o: string) => o === origin)
  )
  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  await Promise.all([
    ENVIRONMENTS.put(context.user.sub, JSON.stringify(environments)),
    // Delete Resolvers from deleted origins
    ...mergeAll(
      deleteOrigins.map(origin =>
        namespaces.map((namespace: any) =>
          RESOLVER.delete(`${context.user.sub}-${origin}-${namespace.id}`)
        )
      )
    ),
    // Create Resolvers of added origins
    ...mergeAll(
      addOrigins.map((origin: string) =>
        namespaces.map(async (namespace: any) =>
          RESOLVER.put(`${context.user.sub}-${origin}-${namespace.id}`, context.body.id)
        )
      )
    )
  ])

  return new Response(null, withStatus(204))
}

export async function deleteEnvironment(context: HTTPContext) {
  const environments: Array<any> = (await ENVIRONMENTS.get(context.user.sub, 'json')) || []

  const environment = environments.find(env => env.id === context.body.id)
  if (!environment) {
    return new Response(null, withStatus(404))
  }

  const remainderEnvironments = environments.filter(env => env.id !== context.body.id)
  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  await Promise.all([
    ENVIRONMENTS.put(context.user.sub, JSON.stringify(remainderEnvironments)),
    // Delete Values
    ...namespaces.map(namespace =>
      VALUES.delete(`${context.user.sub}-${context.body.id}-${namespace.id}`)
    ),
    // Delete Resolvers by environment id
    ...namespaces.map(namespace =>
      RESOLVER.delete(`${context.user.sub}-${context.body.id}-${namespace.id}`)
    ),
    // Delete Resolvers by origin
    ...mergeAll(
      namespaces.map(namespace =>
        environment.origins.map((origin: string) =>
          RESOLVER.delete(`${context.user.sub}-${origin}-${namespace.id}`)
        )
      )
    )
  ])
  return new Response(null, withStatus(204))
}
