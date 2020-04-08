import { KVNamespace } from '@cloudflare/workers-types'

declare global {
  const ENVIRONMENTS: KVNamespace
  const APIKEYS: KVNamespace
  const APIKEY: KVNamespace
  const FLAGS: KVNamespace
  const NAMESPACES: KVNamespace
  const SEGMENTS: KVNamespace
  const SELECTORS: KVNamespace
  const ACCOUNTS: KVNamespace
  const VALUES: KVNamespace
  const RESOLVER: KVNamespace
}
