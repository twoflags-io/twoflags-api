import { LogRegistry } from './helpers'

interface LoggingSetup {
  type: 'datadog'
  apiKey: string
}

const tagKeys = ['environment', 'namespace', 'flag', 'value']

export async function logForAccount(user: any, apiKeyName: string, log: LogRegistry) {
  if (!user.logging) {
    return
  }

  const { type, apiKey } = user.logging as LoggingSetup
  if (type !== 'datadog') {
    return
  }
  const payload = {
    ...log,
    apiKey: apiKeyName,
    ddsource: 'twoflags',
    ddtags: Object.keys(log)
      .filter(k => tagKeys.some(tk => tk === k))
      .map(k => `${k}:${log[k]}`)
      .join(',')
  }

  const logRes = await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'DD-API-KEY': apiKey
    },
    body: JSON.stringify(payload)
  })
  console.log(logRes.status)

  return logRes
}
