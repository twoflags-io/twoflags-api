import { corsHeaders } from './cors'

export const withStatus = (status: number = 200, headers?: any) => ({
  status,
  headers: { ...corsHeaders, ...(headers || {}) }
})

export const withJSON = (status: number = 200, headers?: any) =>
  withStatus(status, { ...headers, 'Content-Type': 'application/json' })

export interface HTTPContext {
  pathname: string
  body?: any
  headers: Headers
  query?: URLSearchParams
  user: any
}

export type HTTPHandler = (context: HTTPContext) => Promise<Response>

export function uuid4(): string {
  function getRandomSymbol(symbol: string) {
    let array

    if (symbol === 'y') {
      array = ['8', '9', 'a', 'b']
      return array[Math.floor(Math.random() * array.length)]
    }

    array = new Uint8Array(1)
    crypto.getRandomValues(array)
    return (array[0] % 16).toString(16)
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, getRandomSymbol)
}

export function mergeAll(arrays: Array<Array<any>>) {
  return arrays.reduce((acc, item) => acc.concat(item), [])
}

export function isObject(val: any) {
  return val !== null && typeof val === 'object' && Array.isArray(val) === false
}
