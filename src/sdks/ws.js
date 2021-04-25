import WebSocket from 'ws'

import { aggTrade, kLine1m, accInfo } from '../sockets'
import { stdInput } from '../components'

export const cutterBot = (SYMBOL) =>
  new Promise((resolve, reject) => {
    const symbol = SYMBOL.toLowerCase()
    console.log('test', symbol)
    const kLineSocket = new WebSocket(kLine1m(symbol))

    const TAG_KLINE_OPEN = '[Current open price]'
    const TAG_KLINE_CLOSE = '[Current close price]'
    const LOG_TAG_KLINE_OPEN = console.draft(
      TAG_KLINE_OPEN,
      'Initializing open price'
    )
    const LOG_TAG_KLINE_CLOSE = console.draft(
      TAG_KLINE_CLOSE,
      'Initializing close price'
    )

    // kLineSocket.on('open', e => console.log(e))
    kLineSocket.on('message', (e) => {
      const data = JSON.parse(e)
      const {
        k: { o: open, c: close, h: high, l: low },
      } = data

      LOG_TAG_KLINE_OPEN(TAG_KLINE_OPEN, open)
      LOG_TAG_KLINE_CLOSE(TAG_KLINE_CLOSE, close)
    })

    kLineSocket.on('error', (e) => console.log(e))
  })
