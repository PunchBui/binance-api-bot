const BASE = process.env.BINANCE_WS_ENDPOINT

export const aggTrade = coinPair => `${BASE}/${coinPair}@aggTrade`
export const kLine1m = coinPair => `${BASE}/${coinPair}@kline_1m`

export const accInfo = listenKey => `${BASE}/api/v3/userDataStream/${listenKey}`