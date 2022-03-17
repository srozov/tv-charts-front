import React from "react";
import { createChart } from 'lightweight-charts';
import {fetchCandles, fetchStrategyValue, generateLineData, getRangeBefore} from "./helpers";

import _ from "lodash";
import data from "bootstrap/js/src/dom/data";

const dataTemplate = {ohlc : []}

class ChartWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.chartDiv = React.createRef();
        this.chart = null;

        this.ohlcSeries = null
        this.valueSeries = {}

        this.fetchForNewVisibleLogicalRange = this.fetchForNewVisibleLogicalRange.bind(this);
        this.onVisibleLogicalRangeChanged = this.onVisibleLogicalRangeChanged.bind(this);

        let data = {...dataTemplate}

        if (this.props.state.strategy){
            this.props.state.strategy.assets.forEach(
                (asset) => {
                    data[asset.asset_name] = []
                }
            )
        }

        this.state = {
            ...this.props.state,
            data : {...data},
            isLoaded: false,
            error: null,
            chart: null,
        }
    }


    fetchForNewVisibleLogicalRange = (newVisibleLogicalRange) => {
        /*
        * helper to calculate range of missing candles before visible range and trigger fetch
        * */

        if (this.ohlcSeries) {

            const barsInfo = this.ohlcSeries.barsInLogicalRange(newVisibleLogicalRange);
            const barLength = this.state.data.ohlc[1].time - this.state.data.ohlc[0].time

            // call helper to estimate number of missing candles before last visible candle
            let rangeBefore = getRangeBefore(barsInfo, barLength)
            let fetchStart, fetchEnd

            fetchStart = rangeBefore.firstInvisibleDate
            fetchEnd = rangeBefore.lastInvisibleDate

            if (barsInfo !== null && barsInfo.barsBefore < 10 && fetchStart !== null && fetchEnd !== null) {
                this.fetchData(fetchStart, fetchEnd)
                    .then(
                        (res) => {
                            if (res) {
                                this.setChartData(this.chart, this.state.data, null);
                            }
                        },
                        (error) => {
                            console.log(error)
                        }
                    )
            }
        }
    }

    onVisibleLogicalRangeChanged(newVisibleLogicalRange) {
        /*
        * handler which sets a timer and fetches missing candles for new visible range
        * */

        // clear timout everytime handler is called (we don't want to fetch while scrolling)
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            this.fetchForNewVisibleLogicalRange(newVisibleLogicalRange)
        }, 100);


    }

    componentDidMount() {
        console.log('component did mount')
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    componentDidUpdate(prevProps, prevState) {

        const prev = _.pick(prevProps.state, ['market', 'strategy', 'timeframe'])
        const current = _.pick(this.props.state, ['market', 'strategy', 'timeframe'])
        // check if props passing Header's state changed
        if (!_.isEqual(prev, current)) {
            // add timer to avoid cascading state update
            clearTimeout(this.timer2)
            this.timer2 = setTimeout(() => {
                console.log('component did update')

                if (this.chart !== null){
                    this.chart.remove()
                    this.setState({
                        data : {...dataTemplate}
                    })
                }

                this.chart = createChart(this.chartDiv.current, {
                    width: 800, height: 400,
                    timeScale: {
                        timeVisible: true,
                        secondsVisible: false,
                        borderColor: '#485c7b',
                    },
                    watermark: {
                        visible: true,
                        fontSize: 34,
                        color: 'rgba(0, 0, 0, 0.25)',
                    },
                    layout: {
                        backgroundColor: '#253248',
                        textColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    grid: {
                        vertLines: {
                            color: '#334158',
                        },
                        horzLines: {
                            color: '#334158',
                        },
                    },
                    priceScale: {
                        borderColor: '#485c7b',
                    },
                });

                // "Setting state" for the chart
                var options = {
                    watermark: {
                        text: this.props.state.market
                    }
                }
                this.chart.applyOptions(options)

                window.addEventListener("resize", this.resizeHandler);
                this.resizeHandler();

                // fetch data with null
                this.fetchData(null, null)
                    .then(
                        (res) => {
                            if (res) {
                                this.initializeChartData(this.chart, this.state.data, this.props.tradeData);
                            }
                        },
                        (error) => {
                            console.log(error)
                        }
                    )

                this.chart.timeScale().subscribeVisibleLogicalRangeChange(this.onVisibleLogicalRangeChanged)
                // TODO: subscribeVisibleTimeRangeChange gives only time range of candles -> useless for loading past candles
                // this.chart.timeScale().subscribeVisibleTimeRangeChange(this.onVisibleLogicalRangeChanged)

            }, 300);
        }
    }

    render() {
        return (
            <div ref={this.chartDiv}
                 style={{ position: "relative" }}>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    resizeHandler = () => {
        this.chart.resize(this.chartDiv.current.parentNode.clientWidth, this.chartDiv.current.parentNode.clientHeight);
    }


    // initialize chart data
    initializeChartData(chart, data, tradeData) {
        if (data.ohlc.length && data.ohlc[0].open) {

            this.ohlcSeries = chart.addCandlestickSeries({ pane: 0 });
            this.ohlcSeries.setData(data.ohlc)

            // this.state.strategy.assets.forEach((asset, index) => {
            //         this.valueSeries[asset.asset_name] = chart.addLineSeries(
            //             {title: asset.asset_name, pane:index + 1}
            //         )
            //     }
            // )

        }
    }

    // update data in ohlcSeries
    setChartData(chart, data, tradeData) {
         if (data.ohlc.length && data.ohlc[0].open) {
             this.ohlcSeries.setData(data.ohlc);
             // this.state.strategy.assets.forEach((asset, index) => {
             //        this.valueSeries[asset.asset_name].setData(data[asset.asset_name])
             //     }
             // )
         }
    }

    // updateChartData(chart, data, tradeData) {
    //     if (data[0].open) {
    //         data.forEach((d, i) => {
    //             this.ohlcSeries.update(d);
    //         })
    //     }
    // }

    async fetchData(start, end) {
        // fetch data based on props only!
        const {market, timeframe, limit, strategy} = this.props.state

        let promises = [];

        promises.push(fetchCandles(market, timeframe, limit, start, end))

        if (strategy && !_.isEmpty(strategy)) {
            strategy.assets.forEach((asset) => {
                promises.push(fetchStrategyValue(strategy.strategy_name, asset.asset_name, timeframe, limit, start, end))
            })
        }

        return await Promise.all(promises).then(
                (res) => {

                    let [candlesRes, ...stratValueRes] = res
                    // ohlc results
                    let data =  {
                    ...this.state.data, ohlc: [...candlesRes, ...this.state.data.ohlc],
                    }
                    // strategy results

                    if (stratValueRes && stratValueRes.length !== 0) {
                        stratValueRes.forEach(
                            (asset, index) => {
                                let asset_name = strategy.assets[index].asset_name

                                if (this.state.data[asset_name]) {
                                    data[asset_name] = [...asset, ...this.state.data[asset_name]]
                                }
                                else {
                                    data[asset_name] = [...asset]
                                }
                            }
                        )
                    }

                    this.setState({
                            data: {...data},
                            isLoaded: true,
                        }
                    );
                    // return just in case
                    return [candlesRes, stratValueRes];
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error1, error2) => {
                    this.setState({
                        isLoaded: false,
                        error: error1,
                    });
                    // return just in case
                    return error1;
                }
            )
        // return candlesRes
    }

    addTradeMarkers(series, tradeData) {
        if (!series || !tradeData) {
            return
        }

        var markers = []
        tradeData.forEach((trade) => {
            if (trade.action === 'sell') {
                markers.push({ time: trade.time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Sell ' + trade.quantity });
            } else {
                markers.push({ time: trade.time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: 'Buy ' + trade.quantity });
            }
        })
        series.setMarkers(markers);
    }
}

export default ChartWrapper