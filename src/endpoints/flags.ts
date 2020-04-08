import { HTTPContext, mergeAll, withJSON, withStatus } from '../common/helpers'
import { MAX_FLAGS, MAX_SELECTORS } from '../limits'
import { validateFlag } from '../validators/flag'
import { validateSelectorRequest } from '../validators/selectorRequest'
import { validateFlagUpdate } from '../validators/flagUpdate'
import { updateResolvers } from './values'

export async function getFlags(context: HTTPContext) {
  const flags: Array<any> = (await FLAGS.get(context.user.sub, 'json')) || []

  return new Response(
    JSON.stringify({
      data: flags,
      slots: MAX_FLAGS - flags.length
    }),
    withJSON(200)
  )
}

export async function createFlag(context: HTTPContext) {
  if (!validateFlag(context.body)) {
    return new Response(null, withStatus(400))
  }

  const flags: Array<any> = (await FLAGS.get(context.user.sub, 'json')) || []

  const existingIndex = flags.findIndex(f => f.id === context.body.id)
  if (existingIndex >= 0) {
    flags[existingIndex] = context.body
  } else {
    if (flags.length >= MAX_FLAGS) {
      return new Response(null, withStatus(412))
    }

    flags.push(context.body)
  }

  await FLAGS.put(context.user.sub, JSON.stringify(flags))

  return new Response(null, withStatus(204))
}

export async function deleteFlag(context: HTTPContext) {
  const flags: Array<any> = (await FLAGS.get(context.user.sub, 'json')) || []

  const flag = flags.find(f => f.id === context.body.id)
  if (!flag) {
    return new Response(null, withStatus(404))
  }

  const remainderFlags = flags.filter(f => f.id !== context.body.id)
  await Promise.all([
    FLAGS.put(context.user.sub, JSON.stringify(remainderFlags)),
    // Delete Flag Selectors (if present)
    SELECTORS.delete(`${context.user.sub}-${context.body.id}`)
  ])

  // Delete flag from all resolvers
  const data: Array<any[] | null> = await Promise.all([
    ENVIRONMENTS.get(context.user.sub, 'json'),
    NAMESPACES.get(context.user.sub, 'json')
  ])
  const environments = data[0] || []
  const namespaces = data[1] || []
  await Promise.all(
    mergeAll(
      environments.map(environment =>
        namespaces.map(namespace =>
          updateResolvers(
            context.user.sub,
            environment.id,
            namespace.id,
            context.body.id,
            null,
            false,
            true,
            environments,
            namespaces,
            flag
          )
        )
      )
    )
  )

  return new Response(null, withStatus(204))
}

export async function updateFlag(context: HTTPContext) {
  if (!validateFlagUpdate(context.body)) {
    return new Response(null, withStatus(400))
  }

  const flags: Array<any> = (await FLAGS.get(context.user.sub, 'json')) || []

  const existingIndex = flags.findIndex(f => f.id === context.body.id)
  if (existingIndex < 0) {
    return new Response(null, withStatus(404))
  }

  const previousFlagDef = flags[existingIndex]
  flags[existingIndex] = { ...flags[existingIndex], ...context.body }
  await FLAGS.put(context.user.sub, JSON.stringify(flags))

  if (context.body.active !== undefined) {
    if (previousFlagDef.active === context.body.active) {
      return new Response(null, withStatus(204))
    }

    const data: Array<any[] | null> = await Promise.all([
      ENVIRONMENTS.get(context.user.sub, 'json'),
      NAMESPACES.get(context.user.sub, 'json')
    ])
    const environments = data[0] || []
    const namespaces = data[1] || []

    if (!context.body.active) {
      // Just remove it from resolvers
      await Promise.all(
        mergeAll(
          environments.map(environment =>
            namespaces.map(namespace =>
              updateResolvers(
                context.user.sub,
                environment.id,
                namespace.id,
                context.body.id,
                null,
                false,
                false,
                environments,
                namespaces,
                previousFlagDef
              )
            )
          )
        )
      )
    } else {
      // Add it again to resolvers
      const valueUpdateResolver = async (env: string, ns: string) => {
        const values: any = (await VALUES.get(`${context.user.sub}-${env}-${ns}`, 'json')) || {}
        const value = context.body.id in values ? values[context.body.id] : null
        return await updateResolvers(
          context.user.sub,
          env,
          ns,
          context.body.id,
          value,
          true,
          false,
          environments,
          namespaces,
          previousFlagDef
        )
      }

      await Promise.all(
        mergeAll(
          environments.map(environment =>
            namespaces.map(namespace => valueUpdateResolver(environment.id, namespace.id))
          )
        )
      )
    }
  }

  return new Response(null, withStatus(204))
}

export async function updateSelector(context: HTTPContext) {
  if (!validateSelectorRequest(context.body)) {
    return new Response(null, withStatus(400))
  }

  const selectorsOp = (selectors: Array<any>) => {
    switch (context.body.op) {
      case 'push': {
        const count = selectors.push({
          label: context.body.label,
          value: context.body.value
        })
        if (count > MAX_SELECTORS) {
          selectors.shift()
        }
        return selectors
      }
      case 'pop': {
        selectors.pop()
        return selectors
      }
      case 'unshift': {
        const count = selectors.unshift({
          label: context.body.label,
          value: context.body.value
        })
        if (count > MAX_SELECTORS) {
          selectors.pop()
        }
        return selectors
      }
      case 'shift': {
        selectors.shift()
        return selectors
      }
    }
    return selectors
  }
  const selectorKey = `${context.user.sub}-${context.body.id}`
  const selectors: Array<any> = (await SELECTORS.get(selectorKey, 'json')) || []

  const resultSelectors = selectorsOp(selectors)

  await SELECTORS.put(selectorKey, JSON.stringify(resultSelectors))

  return new Response(null, withJSON(204))
}

export async function getSelectors(context: HTTPContext) {
  const id = context.query && context.query.get('id')
  if (!id) {
    return new Response(null, withStatus(400))
  }

  const selectors: Array<any> = (await SELECTORS.get(`${context.user.sub}-${id}`, 'json')) || []

  return new Response(
    JSON.stringify({
      data: selectors,
      slots: MAX_SELECTORS - selectors.length
    }),
    withJSON(200)
  )
}

export async function deleteSelector(context: HTTPContext) {
  const selectorId = `${context.user.sub}-${context.body.id}`
  const selectors: Array<any> = (await SELECTORS.get(selectorId, 'json')) || []

  if (context.body.index >= selectors.length) {
    return new Response(null, withStatus(400))
  }

  const remainderSelectors = selectors
    .slice(0, context.body.index)
    .concat(selectors.slice(context.body.index + 1))
  await SELECTORS.put(selectorId, JSON.stringify(remainderSelectors))
  return new Response(null, withStatus(204))
}
