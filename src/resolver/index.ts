import { handleOptions } from '../common/cors'
import { withJSON } from '../common/helpers'

async function digestMessage(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new DataView(hash)
}

async function getEnvData(account: string, env: string, ns: string, uid: string | null) {
  const resolverKey = `${account}-${env}-${ns}`
  const values: any = (await RESOLVER.get(resolverKey, 'json')) || {}

  if (uid) {
    const segment: any | null = await SEGMENTS.get(resolverKey, 'json')
    if (segment) {
      await Promise.all(
        Object.keys(segment).map(async (flag: string) => {
          const data = await digestMessage(uid + flag)
          const pos8 = data.getUint8(0)
          const threshold = Math.floor((pos8 / 256) * 100)
          values[flag] = threshold >= segment[flag] ? 'A' : 'B'
        })
      )
    }
  }

  return new Response(
    JSON.stringify({ flags: values, environment: env, namespace: ns }),
    withJSON(200)
  )
}

async function handleRequest(req: Request): Promise<Response> {
  const urlRequest = new URL(req.url)
  const origin = req.headers.get('origin')
  const hasEnv = urlRequest.searchParams.has('env')
  const account = urlRequest.searchParams.get('account')
  const ns = urlRequest.searchParams.get('ns')
  if ((!origin && !hasEnv) || !account || !ns) {
    return new Response(null, withJSON(400))
  }

  const env = urlRequest.searchParams.get('env')

  // By Env
  if (account && env && ns) {
    return await getEnvData(account, env, ns, urlRequest.searchParams.get('uid'))
  }

  // by Origin
  if (!origin) {
    return new Response(null, withJSON(400))
  }

  const url = new URL(origin)
  const originEnv = await RESOLVER.get(`${account}-${url.host}-${ns}`)

  if (!originEnv) {
    return new Response(null, withJSON(400))
  }

  return await getEnvData(account, originEnv, ns, urlRequest.searchParams.get('uid'))
}

function handler(event: any) {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleOptions(event.request))
  } else {
    event.respondWith(handleRequest(event.request))
  }
}

addEventListener('fetch', handler)
