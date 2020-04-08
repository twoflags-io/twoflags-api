import { HTTPHandler, withStatus } from './helpers'
import { isValidAPIKey } from './apitoken'
import { apiHandlers } from '../api'

export const _handleRequest = (handlers: { [key: string]: HTTPHandler }) =>
  async function (request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/status') {
      return new Response(
        JSON.stringify({ api: 'twoflags', version: '1.0.0' }),
        withStatus(200, { 'Content-Type': 'application/json' })
      )
    }

    // From here on all endpoints must be secured
    const { valid, payload } = await isValidAPIKey(request)

    if (!valid) {
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
        user: payload
      })
    }

    // POST, DELETE
    const body = await request.json()
    return methodPathHandler({
      body,
      headers: request.headers,
      pathname: url.pathname,
      user: payload
    })
  }

export const handleRequest = _handleRequest(apiHandlers)
