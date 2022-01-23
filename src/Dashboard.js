import React, {useState, useEffect, Fragment, Suspense} from 'react';
import ChartWrapper from "./ChartWrapper";
import Header from "./Header";


export default function Dashboard(props) {

    const initState = { market : 'BTCUSDT', timeframe: 'minute', limit: 100, numClicks: 0 }
    const[state, stateSetter]=useState(initState);

    function handleStateChange(newState){
        stateSetter({...state, ...newState});
    }

    return <Fragment>
        <ChartWrapper state={state} handleStateChange={handleStateChange}/>
        <Header state={state} handleStateChange={handleStateChange}/>
    </Fragment>
}