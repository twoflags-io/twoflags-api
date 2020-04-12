import { HTTPHandler, LogRegistry, withStatus } from './helpers'
import { isValidAPIKey } from './apitoken'
import { apiHandlers } from '../api'
import { logForAccount } from './logging'

export const _handleRequest = (handlers: { [key: string]: HTTPHandler }) =>
  async function (event: FetchEvent): Promise<Response> {
    const request = event.request
    const url = new URL(request.url)

    if (url.pathname === '/status') {
      return new Response(
        JSON.stringify({ api: 'twoflags', version: '1.0.0' }),
        withStatus(200, { 'Content-Type': 'application/json' })
      )
    }

    // From here on all endpoints must be secured
    const { valid, payload } = await isValidAPIKey(request)
    const user: any = await ACCOUNTS.get(payload.sub, 'json')

    if (!valid || !user) {
      return new Response(null, withStatus(403))
    }

    const methodPathHandler = handlers[`${request.method}-${url.pathname}`]
    if (!methodPathHandler) {
      return new Response(null, withStatus(404))
    }

    // GET
    if (request.method === 'GET') {
      return methodPathHandler({
        headers: request.headers,
        pathname: url.pathname,
        query: url.searchParams,
        user: { ...user, sub: payload.sub }
      })
    }

    // POST, DELETE
    const body = await request.json()
    const logging = (log: LogRegistry) => {
      event.waitUntil(logForAccount(user, payload.name || '', log))
    }

    return methodPathHandler({
      body,
      headers: request.headers,
      pathname: url.pathname,
      user: { ...user, sub: payload.sub },
      logging: logging
    })
  }

export const handleRequest = _handleRequest(apiHandlers)
