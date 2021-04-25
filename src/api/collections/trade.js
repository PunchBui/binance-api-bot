import queryString from 'querystring'

import { urlTrade, urlRecentTradeList, urlExchgInfo, urlPriceTicker, urlTradeHistory, service } from '../index'
import { METHOD, ORDER } from '../../constants'
import { signature, safeObject } from '../../helpers'

export const order = ({
  symbol,
  side = ORDER.SIDE.BUY,
  type = ORDER.TYPE.MARKET,
  quantity,
  newClientOrderId,
  newOrderRespType,
  quoteOrderQty,
  timestamp = +new Date(),
  timeInForce,
}) => {

  const rawQParams = {
    symbol: symbol.toUpperCase(),
    side,
    type,
    quantity,
    quoteOrderQty,
    newClientOrderId,
    newOrderRespType,
    timestamp,
    timeInForce,
  }
  const safeQParams = safeObject(rawQParams)
  const qParams = {
    ...safeQParams,
    signature: signature(queryString.stringify(safeQParams))
  }

  return service({
    method: METHOD.POST,
    url: urlTrade,
    qParams,
  })
}

export const orderHistory = ({
  symbol,
  orderId,
  timestamp = +new Date(),
}) => {
  const rawQParams = {
    symbol: symbol.toUpperCase(),
    orderId,
    timestamp,
  }
  const safeQParams = safeObject(rawQParams)
  const qParams = {
    ...safeQParams,
    signature: signature(queryString.stringify(safeQParams))
  }
  
  return service({
    method: METHOD.GET,
    url: urlTradeHistory,
    params: qParams,
  })
}

export const recentTradeList = params => {
  params.symbol = params.symbol.toUpperCase()
  
  return service({
    method: METHOD.GET,
    url: urlRecentTradeList,
    params,
  })
}

export const exchgInfo = params => service({
  method: METHOD.GET,
  url: urlExchgInfo,
  params,
})

export const priceTicker = params => {
  params.symbol = params.symbol.toUpperCase()
  
  return service({
    method: METHOD.GET,
    url: urlPriceTicker,
    params,
  })
}
