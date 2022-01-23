import React, { Suspense } from 'react';
import { Container, Form, Spinner, Row, Col, FloatingLabel, Button} from 'react-bootstrap';
import {fetchMarkets, wrapPromise} from "./helpers";
import {TIMEFRAMES} from "./constants";

const marketsResource = wrapPromise(fetchMarkets())


export default function Header({state, handleStateChange}) {

   return (
       <Container>
       <Row className="g-2">
               <Suspense fallback={<Spinner animation="border" />}>
                   <MarketSelect state={state} handleStateChange={handleStateChange}/>
               </Suspense>,
               <Suspense fallback={<Spinner animation="border" />}>
                   <TimeFrameSelect state={state} handleStateChange={handleStateChange}/>
               </Suspense>,
           <LimitSelect state={state} handleStateChange={handleStateChange}/>
           <Col md>
               <Button onClick={() => handleStateChange({numClicks : state.numClicks + 1})}>
                   {state.numClicks}
               </Button>
           </Col>
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
                        // console.log('Header state is:');
                        // console.log(state);
                    }
                }>
                {/*<Form.Select aria-label="Market Select" onChange={(e) => console.log(e.target.value)}>*/}
                {markets.map(m =>
                        <option value={m} key={m}>{m}</option>
                    )}
                </Form.Select>
            </FloatingLabel>
        </Col>
    )
}

function TimeFrameSelect() {

    return (
        <Col md>
            <FloatingLabel controlId="floatingInputGrid" label="Timeframe">
                <Form.Select aria-label="Timeframe Select">
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
                        // console.log('Header state is:');
                        // console.log(state);
                    }
                }/>
            </FloatingLabel>
        </Col>
    )
}

// function AButton() {
//
//     return (
//         <Col md>
//
//         </Col>
//     )
// }