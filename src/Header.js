import React, {Suspense, useEffect, useState} from 'react';
import { Container, Form, Spinner, Row, Col, FloatingLabel, Button} from 'react-bootstrap';
import usePrevious, {fetchMarkets, fetchStrategies, fetchStrategyValue, wrapPromise} from "./helpers";
import {STRATEGIES_API, TIMEFRAMES} from "./constants";

const marketsResource = wrapPromise(fetchMarkets())
// first fetch with default state
const initialStrategiesResource = wrapPromise(fetchStrategies('minute'))

// const strategiesResource = (timeframe) => wrapPromise(fetchStrategies(timeframe))


// const strategiesResource = (timeframe) => {
//     return wrapPromise(fetchStrategies(timeframe))
// }

export default function Header({state, handleStateChange}) {

    const [strategiesResource, setStrategiesResource] = useState(initialStrategiesResource);

    return (
        <Container>
            <Row className="g-2">
                <Suspense fallback={<Spinner animation="border" />}>
                    <MarketSelect state={state} handleStateChange={handleStateChange}/>
                </Suspense>
                <Suspense fallback={<Spinner animation="border" />}>
                    <TimeFrameSelect state={state} setStrategiesResource={setStrategiesResource}/>
                </Suspense>
                <Suspense fallback={<Spinner animation="border" />}>
                    <StrategySelect state={state} resource={strategiesResource} handleStateChange={handleStateChange}/>
                </Suspense>
                <LimitSelect state={state} handleStateChange={handleStateChange}/>
                {/*<Col md>*/}
                {/*    <Button onClick={() => handleStateChange({numClicks : state.numClicks + 1})}>*/}
                {/*        {state.numClicks}*/}
                {/*    </Button>*/}
                {/*</Col>*/}
            </Row>
        </Container>
    )
}

function MarketSelect({state, handleStateChange}) {

    const markets = marketsResource.read()

    return (
        <Col md>
            <FloatingLabel controlId="floatingInputGrid" label="Market">
                <Form.Select aria-label="Market Select" onChange={
                    (e) => {
                        handleStateChange({market: e.target.value});
                    }
                }>
                {markets.map(m =>
                        <option value={m} key={m}>{m}</option>
                    )}
                </Form.Select>
            </FloatingLabel>
        </Col>
    )
}

function TimeFrameSelect({state, setStrategiesResource}) {

    return (
        <Col md>
            <FloatingLabel controlId="floatingInputGrid" label="Timeframe">
                <Form.Select aria-label="Timeframe Select" onChange={
                    (e) => {
                        setStrategiesResource(wrapPromise(fetchStrategies(e.target.value)));
                    }
                }>
                {TIMEFRAMES.map(t =>
                    <option value={t} key={t}>{t}</option>
                )}
                </Form.Select>
            </FloatingLabel>
        </Col>
    )
}

function LimitSelect({state, handleStateChange}) {

    return (
        <Col md>
            <FloatingLabel controlId="floatingInputGrid" label="Limit">
                <Form.Control value={state.limit} onChange={
                    (e) => {
                        handleStateChange({limit: e.target.value});
                    }
                }/>
            </FloatingLabel>
        </Col>
    )
}

function StrategySelect({ state, resource, handleStateChange}) {

    const {} = state
    const strategies = resource.read()
    let defaultStrategy
    let defaultStrategyName

    useEffect(() => {
        // this effect should only run when strategies changes -> only once on page load
        // (substitute for componentDidMount)
        if (strategies) {
            defaultStrategy = strategies[0]
            defaultStrategyName = defaultStrategy.strategy_name
            handleStateChange({ strategy: defaultStrategy })
        }
        }, [strategies])


        return (
        <Col md>
            <FloatingLabel controlId="floatingInputGrid" label="Strategy">
                <Form.Select aria-label="Strategy Select" defaultValue={defaultStrategyName} onChange={
                    (e) => {
                        handleStateChange({
                            strategy: strategies.find(s => { return s.strategy_name === e.target.value })
                        });
                    }
                }>
                    {strategies.map(s =>
                        <option value={s.strategy_name} key={s.strategy_id}>{s.strategy_name}</option>
                    )}
                </Form.Select>
            </FloatingLabel>
        </Col>
    )
}
