import { HTTPContext, withStatus } from '../common/helpers'

export async function updateAccount(context: HTTPContext) {
  await ACCOUNTS.put(context.user.sub, JSON.stringify(context.body))
  return new Response(null, withStatus(204))
}
