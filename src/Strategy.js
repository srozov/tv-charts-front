import React from 'react';
import {Card, Row, Col, Container} from 'react-bootstrap';

export default function Strategy({strategy}) {

    if (strategy) {
        let { start_date, strategy_balance, strategy_name, time_frame } = strategy

        return (
            <Container>
                <Card style={{ width: "18rem" }}>
                    <Card.Header> {strategy_name} </Card.Header>
                    {/*<Card.Body>*/}
                    <table className="items-center w-full bg-transparent border-collapse">
                        <tbody>
                        <tr >
                            <th>Start Date</th>
                            <td>{start_date}</td>
                        </tr>
                        <tr>
                            <th>Balance</th>
                            <td>{strategy_balance}</td>
                        </tr>
                        <tr>
                            <th>Timeframe</th>
                            <td>{time_frame}</td>
                        </tr>
                        </tbody>
                    </table>
                    {/*</Card.Body>*/}
                </Card>
            </Container>
        )
    }

    else return <Card></Card>
}