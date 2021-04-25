import _ from 'lodash'

import { tradeApi, userDataApi } from '../api'
import { ORDER } from '../constants'

export const getExchangeInfo = async (symbol) => {
  const SYMBOL = symbol.toUpperCase()
  const responseExchgInfo = await tradeApi.exchgInfo()
  const symbolInfo = responseExchgInfo.data.symbols.find(({ symbol }) => symbol === SYMBOL)
  const baseAsset = symbolInfo.baseAsset
  const quoteAsset = symbolInfo.quoteAsset
  const filters = {
    priceFilter: symbolInfo.filters.find(({ filterType }) => filterType === 'PRICE_FILTER'),
    percentPrice: symbolInfo.filters.find(({ filterType }) => filterType === 'PERCENT_PRICE'),
    minNotional: symbolInfo.filters.find(({ filterType }) => filterType === 'MIN_NOTIONAL'),
    icebergParts: symbolInfo.filters.find(({ filterType }) => filterType === 'ICEBERG_PARTS'),
    lotSize: symbolInfo.filters.find(({ filterType }) => filterType === 'LOT_SIZE'),
    marketLotSize: symbolInfo.filters.find(({ filterType }) => filterType === 'MARKET_LOT_SIZE'),
  }
  console.log(filters.minNotional)
  console.log(filters.lotSize)
  console.log(filters.percentPrice)
  console.log(filters.marketLotSize)

  // const minQty = filters.lotSize.minQty
  // const maxQty = filters.lotSize.maxQty
  // const stepSize = filters.lotSize.stepSize
  // console.log('minQty', minQty)
  // console.log('maxQty', maxQty)
  // console.log('stepSize', stepSize)

  return {
    filters,
    baseAsset,
    quoteAsset,
  }
}

export const getTicker = async (symbol) => {
  const SYMBOL = symbol.toUpperCase()
  const responseSymbolTicker = await tradeApi.priceTicker({
    symbol: SYMBOL,
  })
  const currentPrice = responseSymbolTicker.data.price

  return currentPrice
}
export const getBalances = async () => {
  const responseUserData = await userDataApi.getUserData()
  const balances = responseUserData.data.balances

  return balances
}

export const executeOrder = async (symbol, side, balance, type) => {
  const SYMBOL = symbol.toUpperCase()
  const quantity = side === ORDER.SIDE.BUY ? { quoteOrderQty: balance } : { quantity: balance }

  const responseOrder = await tradeApi.order({
    ...quantity,
    symbol: SYMBOL,
    side: side,
    type: type,
  })
  const status = responseOrder.data.status
  const orderId = responseOrder.data.orderId
  const fills = responseOrder.data.fills
  const avgEntryPrice = !_.isEmpty(fills) ? fills.map(({ price }) => price).reduce((a, b) => +a + +b) / fills.length : 'empty' // Average of entry symbol price
  console.log('status ', status)
  console.log('orderId ', orderId)

  return {
    status,
    orderId,
    fills,
    avgEntryPrice,
  }
}

export const getHistory = async (symbol, orderId) => {

  const responseOrderHistory = await tradeApi.orderHistory({
    symbol,
    orderId,
  })
  const executedQty = responseOrderHistory.data.executedQty // how many Amount of left-side did you buy
  const cummulativeQuoteQty = responseOrderHistory.data.cummulativeQuoteQty // how many right-side did you spend.

  return {
    executedQty,
    cummulativeQuoteQty
  }
}