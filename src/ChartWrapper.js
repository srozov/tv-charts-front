import React from "react";
import { createChart } from 'lightweight-charts';
import { fetchCandles, getRangeBefore } from "./helpers";


class ChartWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.chartDiv = React.createRef();

        this.lineSeries = null

        this.fetchForNewVisibleLogicalRange = this.fetchForNewVisibleLogicalRange.bind(this);
        this.onVisibleLogicalRangeChanged = this.onVisibleLogicalRangeChanged.bind(this);

        this.state = {
            ...this.props.state,
            data : [],
            // displayStart: null,
            // displayEnd: null,
            isLoaded: false,
            error: null,
            chart: null,
        }
    }


    fetchForNewVisibleLogicalRange = (newVisibleLogicalRange) => {
        /*
        * helper to calculate range of missing candles before visible range and trigger fetch
        * */

        if (this.lineSeries) {

            const barsInfo = this.lineSeries.barsInLogicalRange(newVisibleLogicalRange);
            const barLength = this.state.data[1].time - this.state.data[0].time

            // call helper to estimate number of missing candles before last visible candle
            let rangeBefore = getRangeBefore(barsInfo, barLength)
            let fetchStart, fetchEnd

            fetchStart = rangeBefore.firstInvisibleDate
            fetchEnd = rangeBefore.lastInvisibleDate

            if (barsInfo !== null && barsInfo.barsBefore < 10 && fetchStart !== null && fetchEnd !== null) {
                this.fetchData(fetchStart, fetchEnd)
                    .then(
                        (result) => {
                            if (result) {
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

        console.log('component did mount')
        // fetch data with null
        this.fetchData(null, null)
            .then(
                (result) => {
                    if (result) {
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

        window.addEventListener("resize", this.resizeHandler);
        this.resizeHandler();
    }


    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('component did update')
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
        if (data[0].open) {
            this.lineSeries = chart.addCandlestickSeries();
            this.lineSeries.setData(data)
            // this.addTradeMarkers(chart.lineSeries, tradeData)
        }
    }

    // update data in lineSeries
    setChartData(chart, data, tradeData) {
         if (data[0].open) {
             this.lineSeries.setData(data);
        }
    }

    updateChartData(chart, data, tradeData) {
        if (data[0].open) {
            data.forEach((d, i) => {
                this.lineSeries.update(d);
            })
        }
    }

    fetchData(start, end){
        // fetch data based on props only!
        const { market, timeframe, limit } = this.props.state

        return fetchCandles(market, timeframe, limit, start, end)
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        data: [...result, ...this.state.data],
                    });
                    // return just in case
                    return result;
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({
                        isLoaded: false,
                        error
                    });
                    // return just in case
                    return error;
                }
            )
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