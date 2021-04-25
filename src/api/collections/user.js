import queryString from 'querystring'

import { urlUserDataStream, service, urlUserInfo } from '../index'
import { METHOD } from '../../constants'
import { signature } from '../../helpers'

export const createUserDataStream = () => service({
  method: METHOD.POST,
  url: urlUserDataStream,
})

export const getUserData = () => {
  const params = {
    timestamp: +new Date(),
  }

  return service({
    method: METHOD.GET,
    url: urlUserInfo,
    params: {
      ...params,
      signature: signature(queryString.stringify(params))
    }
  })
}