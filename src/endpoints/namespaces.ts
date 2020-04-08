import { HTTPContext, mergeAll, withJSON, withStatus } from '../common/helpers'
import { MAX_NAMESPACES } from '../limits'
import { validateNamespace } from '../validators/namespace'
import { validateNamespaceUpdate } from '../validators/namespaceUpdate'

export async function getNamespaces(context: HTTPContext) {
  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  return new Response(
    JSON.stringify({
      data: namespaces,
      slots: MAX_NAMESPACES - namespaces.length
    }),
    withJSON(200)
  )
}

export async function createNamespace(context: HTTPContext) {
  if (!validateNamespace(context.body)) {
    return new Response(null, withStatus(400))
  }

  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  const existingIndex = namespaces.findIndex(n => n.id === context.body.id)
  if (existingIndex >= 0) {
    namespaces[existingIndex] = context.body
  } else {
    if (namespaces.length >= MAX_NAMESPACES) {
      return new Response(null, withStatus(412))
    }

    namespaces.push(context.body)
  }

  await NAMESPACES.put(context.user.sub, JSON.stringify(namespaces))

  return new Response(null, withStatus(204))
}

export async function updateNamespace(context: HTTPContext) {
  if (!validateNamespaceUpdate(context.body)) {
    return new Response(null, withStatus(400))
  }

  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  const existingIndex = namespaces.findIndex(f => f.id === context.body.id)
  if (existingIndex >= 0) {
    namespaces[existingIndex] = {
      ...namespaces[existingIndex],
      ...context.body
    }
  } else {
    return new Response(null, withStatus(404))
  }

  await NAMESPACES.put(context.user.sub, JSON.stringify(namespaces))

  return new Response(null, withStatus(204))
}

export async function deleteNamespace(context: HTTPContext) {
  const namespaces: Array<any> = (await NAMESPACES.get(context.user.sub, 'json')) || []

  const remainderNamespaces = namespaces.filter(n => n.id !== context.body.id)

  const environments: Array<any> = (await ENVIRONMENTS.get(context.user.sub, 'json')) || []

  await Promise.all([
    NAMESPACES.put(context.user.sub, JSON.stringify(remainderNamespaces)),
    // Delete Values
    ...environments.map(environment =>
      VALUES.delete(`${context.user.sub}-${environment.id}-${context.body.id}`)
    ),
    // Delete Resolvers by environment id
    ...environments.map(environment =>
      RESOLVER.delete(`${context.user.sub}-${environment.id}-${context.body.id}`)
    ),
    // Delete Resolvers by origin
    ...mergeAll(
      environments.map(environment =>
        environment.origins.map((origin: string) =>
          RESOLVER.delete(`${context.user.sub}-${origin}-${context.body.id}`)
        )
      )
    )
  ])

  return new Response(null, withStatus(204))
}
