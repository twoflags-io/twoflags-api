import { handleOptions } from './common/cors'
import { handleRequest } from './common/handler'

function handler(event: any) {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleOptions(event.request))
  } else {
    event.respondWith(handleRequest(event.request))
  }
}

addEventListener('fetch', handler)
