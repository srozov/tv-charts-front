import {CANDLES_API_ENDPOINT, CANDLES_ENDPOINT, MARKETS_API} from "./constants";


export const fetchCandles = (
    asset_name, timeframe='minute', limit=10, start=null, end=null
) => {
    let range
    console.log('start:', start)
    console.log('end:', end)
    if (start && end) {
        range = `start=${start}&end=${end}`
    }
    else if (limit) {
        range = `limit=${limit}`
    }
    else {
        range = `limit=10`
    }

    return fetch(MARKETS_API + '/' + asset_name + '/' + timeframe + CANDLES_ENDPOINT + range)
        .then(res => res.json())
}

export const fetchMarkets = () => {
    return fetch(MARKETS_API)
        .then(res => res.json())
}


export const getRangeBefore = (barsInfo, barLength) => {

    let firstVisibleDate, lastInvisibleDate, firstInvisibleDate
    firstInvisibleDate = null

    if ( barsInfo && barsInfo.barsBefore < 0) {
        firstVisibleDate = barsInfo.from
        lastInvisibleDate = firstVisibleDate - barLength
        firstInvisibleDate = lastInvisibleDate + Math.floor(barsInfo.barsBefore) * barLength
    }
    else {
        firstVisibleDate = lastInvisibleDate = null
    }

    return { firstInvisibleDate, lastInvisibleDate }
}

export const wrapPromise = (promise) => {
    let status = "pending";
    let result;
    let suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        },
    };
}