import axios from 'axios'

import { METHOD } from './../constants'

/* config */
axios.defaults.headers.common = {
  Accept: 'application/json; charset=utf-8',
  'Content-Type': 'application/json',
  'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
}


const config = {
  baseURL: process.env.BINANCE_API_ENDPOINT,
}

export const service = ({
  method = METHOD.GET,
  url = '',
  params = {},
  qParams = {}
}) => {
  let axiosMethod = axios[method]

  switch (method) {
    case METHOD.POST:
    case METHOD.PUT:
    case METHOD.PATCH:
      const adConfig = {
        ...config,
        params: qParams,
      }
      axiosMethod = axiosMethod(url, null, adConfig)
      break

    default:
      axiosMethod = axiosMethod(url, { ...config, params })
      break
  }

  return axiosMethod
}
