import DraftLog from 'draftlog'
import axios from 'axios'
import chalk from 'chalk'
import WebSocket from 'ws'

import { aggTrade, kLine1m, accInfo } from './sockets'
import { stdInput } from './components'
import { tradeApi, userDataApi } from './api'
import { ORDER } from './constants'
import {
  getExchangeInfo,
  getTicker,
  getBalances,
  executeOrder,
  getHistory,
  cutterBot,
} from './sdks'

// INIT STDIO
DraftLog(console)

export const app = async () => {
  // INITIALIZE

  try {
    // GET SYMBOLS
    // const symbol = (
    //   await stdInput('Enter coin pair e.g. btcusdt', 'start pumping')
    // ).toUpperCase()
    const symbol = 'btcusdt'.toUpperCase()

    // GET MARKET DATA
    const exchangeInfo = await getExchangeInfo(symbol)
    const leftSymbol = exchangeInfo.baseAsset
    const rightSymbol = exchangeInfo.quoteAsset
    const LEFT_SYMBOL = leftSymbol.toUpperCase()
    const RIGHT_SYMBOL = rightSymbol.toUpperCase()

    // GET SYMBOL TICKER(PRICE)
    const buyTicker = await getTicker(symbol)
    console.log(`currentPrice(${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`, buyTicker)

    const result = await cutterBot(symbol)

    if (true) {
      // buy
      // GET USER DATA BALANCE BUY
      const balancesBefore = await getBalances(rightSymbol)
      const rightSymbolBalanceBefore = balancesBefore.find(
        ({ asset }) => asset === RIGHT_SYMBOL
      )
      const leftSymbolBalanceBefore = balancesBefore.find(
        ({ asset }) => asset === LEFT_SYMBOL
      )
      console.log(`balance(${RIGHT_SYMBOL})`, rightSymbolBalanceBefore.free)
      console.log(`balance(${LEFT_SYMBOL})`, leftSymbolBalanceBefore.free)

      // ORDER BUY
      const resultOrder = await executeOrder(
        symbol,
        ORDER.SIDE.BUY,
        0.01,
        ORDER.TYPE.MARKET
      ) //rightSymbolBalanceBefore.free)//balanceBuy)
      console.log(
        `avgEntryPrice (${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        resultOrder.avgEntryPrice
      )

      // ORDER HISTORY
      const buyOrderDetail = await getHistory(symbol, resultOrder.orderId)
      const totalReceived =
        resultOrder.avgEntryPrice * buyOrderDetail.executedQty // Earned of left-side
      console.log(
        `totalReceived(${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        totalReceived
      )
    }

    if (false) {
      // limit
      // GET SYMBOL TICKER(PRICE)
      const sellTicker = await getTicker(symbol)
      console.log(
        `currentPrice(${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        sellTicker
      )

      // GET USER DATA BALANCE SELL
      const balancesAfter = await getBalances(rightSymbol)
      const rightSymbolBalanceAfter = balancesAfter.find(
        ({ asset }) => asset === RIGHT_SYMBOL
      )
      const leftSymbolBalanceAfter = balancesAfter.find(
        ({ asset }) => asset === LEFT_SYMBOL
      )
      console.log(`balance(${RIGHT_SYMBOL})`, rightSymbolBalanceAfter.free)
      console.log(`balance(${LEFT_SYMBOL})`, leftSymbolBalanceAfter.free)

      const responseOrder = await tradeApi.order({
        quantity: leftSymbolBalanceAfter.free,
        symbol: symbol,
        side: ORDER.SIDE.SELL,
        type: ORDER.TYPE.LIMIT,
        price: buyTicker * 5,
        timeInForce: 'GTC',
      })
      console.log(responseOrder)
      // ORDER SELL
      //  const resultOrderSell = await executeOrder(symbol, ORDER.SIDE.SELL, 0.1, ORDER.TYPE.LIMIT)//leftSymbolBalanceAfter.free)//balanceBuy)
      //  console.log(`avgEntryPrice (${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`, resultOrderSell.avgEntryPrice)
    }

    if (true) {
      // sell
      // BOT PROCESS AUTO-CUT
      // const result = await cutterBot(symbol)
      // TODO: PROFIT ALGORITHM

      // GET SYMBOL TICKER(PRICE)
      const sellTicker = await getTicker(symbol)
      console.log(
        `currentPrice(${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        sellTicker
      )

      // GET USER DATA BALANCE SELL
      const balancesAfter = await getBalances(rightSymbol)
      const rightSymbolBalanceAfter = balancesAfter.find(
        ({ asset }) => asset === RIGHT_SYMBOL
      )
      const leftSymbolBalanceAfter = balancesAfter.find(
        ({ asset }) => asset === LEFT_SYMBOL
      )
      console.log(`balance(${RIGHT_SYMBOL})`, rightSymbolBalanceAfter.free)
      console.log(`balance(${LEFT_SYMBOL})`, leftSymbolBalanceAfter.free)

      // ORDER SELL
      const resultOrderSell = await executeOrder(symbol, ORDER.SIDE.SELL, 0.1) //leftSymbolBalanceAfter.free)//balanceBuy)
      console.log(
        `avgEntryPrice (${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        resultOrderSell.avgEntryPrice
      )

      // ORDER HISTORY
      const sellOrderDetail = await getHistory(symbol, resultOrderSell.orderId)
      const totalReceivedSell =
        resultOrderSell.avgEntryPrice * sellOrderDetail.executedQty // Earned of left-side
      console.log(
        `totalReceived(${LEFT_SYMBOL} per ${RIGHT_SYMBOL})`,
        totalReceivedSell
      )

      const profit =
        sellTicker * sellOrderDetail.executedQty -
        sellOrderDetail.cummulativeQuoteQty
      console.log('profit', profit)
    }
  } catch (err) {
    if (err.response) return console.log(err.response.data.msg)
    console.log(err)
  }
}

// export const app = async () => {
//   try {
//     // Constants zone.
//     // const symbol = await stdInput('Enter coin pair e.g. btcusdt', 'start pumping')
//     const symbol = 'bnbbtc'
//     const SYMBOL = symbol.toUpperCase()
//     const responseUserData = await userDataApi.getUserData()
//     const responseExchgInfo = await tradeApi.exchgInfo()
//     const responseRecentTradeList = await tradeApi.recentTradeList({
//       symbol,
//       limit: 1,
//     })

//     const balance = +(responseUserData.data.balances.find(({ asset }) => asset === 'BTC').free)
//     const latestPrice = responseRecentTradeList.data[0].price
//     const quantity = ((balance/latestPrice)*0.9995)
//     console.log('balance', (+balance))

//     const symbolInfo = responseExchgInfo.data.symbols.find(({ symbol }) => symbol === SYMBOL)
//     const lotSize = symbolInfo.filters.find(({ filterType }) => filterType === 'LOT_SIZE')
//     const minQty = lotSize.minQty
//     const maxQty = lotSize.maxQty
//     const stepSize = lotSize.stepSize
//     console.log(symbolInfo)
//     console.log(minQty, maxQty, stepSize)
//     console.log((quantity-minQty) % stepSize == 0)

//     function a(qty, stepSize ) {
//       // Integers do not require rounding
//       if ( Number.isInteger( qty ) ) return qty;
//       const qtyString = qty.toFixed( 16 );
//       const desiredDecimals = Math.max( stepSize.indexOf( '1' ) - 1, 0 );
//       const decimalIndex = qtyString.indexOf( '.' );
//       return parseFloat( qtyString.slice( 0, decimalIndex + desiredDecimals + 1 ) );
//     }
//     console.log('accept price', a(quantity, stepSize))

//     function round(value, decimals) {
//       return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
//     }
//     const minimumQuantity = round(quantity, 6)
//     console.log('quantity', quantity)
//     console.log('minimumQuantity', minimumQuantity)
//     console.log('latestPrice', latestPrice)

//     const response = await tradeApi.order({
//       symbol,
//       quantity: a(quantity, stepSize),
//     })

//     console.log(response.data)
//     // const {
//     //   orderId,
//     //   clientOrderId,
//     //   price,
//     //   origQty,
//     //   executedQty: responseExecutedQty,
//     //   cummulativeQuoteQty: responseCummulativeQuoteQty,
//     //   fills,
//     // } = response.data
//     // console.log(fills.map(({ price }) => price).reduce((a, b) => +a + +b) / fills.length)
//     // const entryPrice = fills.map(({ price }) => price).reduce((a, b) => a + b) / fills.length
//     // console.log('entryPrice', entryPrice, fills.length)

//     // executedQty = responseExecutedQty
//     // cummulativeQuoteQty = responseCummulativeQuoteQty

//     const TAG_ENTRY_PRICE = '[Entry price]'
//     const TAG_PNL = '[Unrealized PNL]'
//     const TAG_PNL_PERCENT = '[Unrealized PNL%]'
//     const TAG_CURRENT_PRICE = '[Current price]'
//     const TAG_KLINE_OPEN = '[Current open price]'
//     const TAG_KLINE_CLOSE = '[Current close price]'
//     const LOG_ENTRY_PRICE = console.draft(
//       TAG_ENTRY_PRICE,
//       'Initializing entry price'
//     )
//     const LOG_PNL = console.draft(TAG_PNL, 'Initializing PNL')
//     const LOG_PNL_PERCENT = console.draft(
//       TAG_PNL_PERCENT,
//       'Initializing PNL(%)'
//     )
//     const LOG_TAG_KLINE_OPEN = console.draft(
//       TAG_KLINE_OPEN,
//       'Initializing open price'
//     )
//     const LOG_TAG_KLINE_CLOSE = console.draft(
//       TAG_KLINE_CLOSE,
//       'Initializing close price'
//     )
//     const LOG_CURRENT_PRICE = console.draft(
//       TAG_CURRENT_PRICE,
//       'Initializing current price'
//     )

//     //entry price
//     // LOG_ENTRY_PRICE(chalk.yellow(TAG_ENTRY_PRICE), entryPrice)

//     //acc stream

//     //kline socket
//     const kLineSocket = new WebSocket(kLine1m(symbol))

//     kLineSocket.on('message', (e) => {
//       const data = JSON.parse(e)
//       const {
//         k: { o: open, c: close },
//       } = data

//       LOG_TAG_KLINE_OPEN(TAG_KLINE_OPEN, open)
//       LOG_TAG_KLINE_CLOSE(TAG_KLINE_CLOSE, close)
//     })

//     //aggTrade socket
//     const aggTradeSocket = new WebSocket(aggTrade(symbol))

//     const restart = () => {
//       aggTradeSocket.close()
//       console.log('Restarting app...')
//       app()
//     }

//     aggTradeSocket.on('error', (e) => {
//       console.log('Error => ', e)
//       restart()
//     })

//     aggTradeSocket.on('message', (e) => {
//       const data = JSON.parse(e)
//       const { p: currentPrice, q: currentQuantity } = data

//       // const unrealizedPNL = executedQty * (currentPrice - cummulativeQuoteQty)
//       // console.log(cummulativeQuoteQty, currentPrice, cummulativeQuoteQty, entryPrice)
//       // const unrealizedPNLPercent = (
//       //   ((cummulativeQuoteQty * currentPrice) /
//       //     (cummulativeQuoteQty - entryPrice)) *
//       //   100
//       // ).toFixed(3)

//       LOG_PNL(TAG_PNL, unrealizedPNL)
//       LOG_PNL_PERCENT(TAG_PNL_PERCENT, `${unrealizedPNLPercent}%`)
//       LOG_CURRENT_PRICE(TAG_CURRENT_PRICE, currentPrice)
//     })
//   } catch (err) {
//     console.log('Error accrue')
//     if (err.response) {
//       console.log(err.response.data.msg)
//       return
//     }
//     console.log(err)

//   }
// }
