import { HTTPContext, uuid4, withJSON, withStatus } from '../common/helpers'
import { MAX_APIKEYS } from '../limits'

export async function getAPIKeys(context: HTTPContext) {
  const apiKeys: Array<any> = (await APIKEYS.get(context.user.sub, 'json')) || []
  const omitKey = (apiKey: any) => {
    const { key: _key, ...rest } = apiKey
    return rest
  }

  // Populate last_used property
  for (let index = 0; index < apiKeys.length; index += 1) {
    const keyUse: any = await APIKEY.get(apiKeys[index].key, 'json')
    apiKeys[index].last_used = keyUse.last_used
  }

  return new Response(
    JSON.stringify({
      data: apiKeys.map(omitKey),
      slots: MAX_APIKEYS - apiKeys.length
    }),
    withJSON(200)
  )
}

export async function createAPIKey(context: HTTPContext) {
  const apiKeys: Array<any> = (await APIKEYS.get(context.user.sub, 'json')) || []

  if (apiKeys.length >= MAX_APIKEYS) {
    return new Response(null, withStatus(412))
  }

  const key: any = {
    id: context.body.id,
    key: uuid4(),
    created_by: context.user.sub,
    created_at: new Date().toISOString()
  }
  const keyUse = { sub: key.created_by, last_used: null }

  await APIKEY.put(key.key, JSON.stringify(keyUse))

  apiKeys.push(key)
  await APIKEYS.put(context.user.sub, JSON.stringify(apiKeys))

  key.last_used = keyUse.last_used
  return new Response(JSON.stringify(key), withJSON(200))
}

export async function deleteAPIKey(context: HTTPContext) {
  const apiKeys: Array<any> = (await APIKEYS.get(context.user.sub, 'json')) || []

  const key = apiKeys.find(k => k.id === context.body.id)
  if (key) {
    await APIKEY.delete(key.key)
  }

  const remainderAPIKeys = apiKeys.filter(k => k.id !== context.body.id)
  await APIKEYS.put(context.user.sub, JSON.stringify(remainderAPIKeys))
  return new Response(null, withStatus(204))
}
