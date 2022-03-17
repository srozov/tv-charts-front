import {CANDLES_API_ENDPOINT, CANDLES_ENDPOINT, MARKETS_API, STRATEGIES_API} from "./constants";
import {useEffect, useRef} from "react";


export const fetchCandles = (
    asset_name, timeframe='minute', limit=10, start=null, end=null
) => {
    let range
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

export const fetchStrategies = (asset_name, timeframe) => {

    return fetch(STRATEGIES_API + `?timeframe=${timeframe}&asset_name=${asset_name}`)
        .then(res => res.json())
}

export const fetchStrategyValue = (
    strategy_name, asset_name, timeframe, limit=10, start=null, end=null
) => {

    let range
    if (start && end) {
        range = `start=${start}&end=${end}`
    }
    else if (limit) {
        range = `limit=${limit}`
    }
    else {
        range = `limit=10`
    }

    return fetch(STRATEGIES_API
        + `/${strategy_name}/${asset_name}/value?timeframe=${timeframe}&` + range)
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

export function generateLineData(minValue, maxValue, maxDailyGainLoss = 1000) {
    var res = [];
    var time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
    for (var i = 0; i < 500; ++i) {
        var previous = res.length > 0 ? res[res.length - 1] : { value: 0 };
        var newValue = previous.value + ((Math.random() * maxDailyGainLoss * 2) - maxDailyGainLoss);

        res.push({
            time: time.getTime() / 1000,
            value: Math.max(minValue, Math.min(maxValue, newValue))
        });

        time.setUTCDate(time.getUTCDate() + 1);
    }

    return res;
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value; //assign the value of ref to the argument
    },[value]); //this code will run when the value of 'value' changes
    return ref.current; //in the end, return the current ref value.
}
export default usePrevious;