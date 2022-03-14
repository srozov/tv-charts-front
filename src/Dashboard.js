import React, {useState, useEffect, Fragment, Suspense} from 'react';
import ChartWrapper from "./ChartWrapper";
import Header from "./Header";
import Strategy from "./Strategy";
import {Stack} from "react-bootstrap";
import {fetchStrategies, wrapPromise} from "./helpers";

const initialStrategiesResource = wrapPromise(fetchStrategies('minute'))

export default function Dashboard(props) {

    const strategies = initialStrategiesResource.read()

    let defaultStrategy
    let defaultStrategyName

    useEffect(() => {
        // this effect should only run when strategies changes -> only once on page load
        // (substitute for componentDidMount)
        // if (strategies) {
        defaultStrategy = strategies[0]
        defaultStrategyName = defaultStrategy.strategy_name
            // handleStateChange({ strategy: defaultStrategy })
        // }
    }, [strategies])


    const initState = {
        market : 'BTCUSDT',
        strategy: {
            strategy_name : 'factorycreated_strategy_1',
            assets: [{asset_name: 'BTCUSDT'}, {asset_name: 'USDT'}]
        },
        // strategy: {...defaultStrategy},
        timeframe: 'minute',
        limit: 100,
        numClicks: 0 }

    const[state, stateSetter]=useState(initState);

    function handleStateChange(newState){
        stateSetter({...state, ...newState});
    }

    return <Stack direction="vertical" gap={3}>
        <ChartWrapper state={state} handleStateChange={handleStateChange}/>
        <Header state={state} handleStateChange={handleStateChange}/>
        <Strategy strategy={state.strategy}/>
    </Stack>
}