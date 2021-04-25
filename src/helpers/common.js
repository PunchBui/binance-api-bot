import crypto from 'crypto'

export function signature(query_string) {
  return crypto
      .createHmac('sha256', process.env.BINANCE_API_SECRET)
      .update(query_string)
      .digest('hex');
}

export const safeObject = (object) => {
  let result = {}
  for (const [key, value] of Object.entries(object)) {
    if (value) {
      result[key] = value
    }
  }
  return result
}