import React, { Component } from 'react';
import './App.css';
import './bootstrap.min.css';
import * as d3 from 'd3';
import * as moment from 'moment';

var NumberFormat = require('react-number-format');


class App extends Component {
  render() {
    return (
      
      <div className="Btc-board">
      <div className="btc-logo">
          <img src={require("./images/btc-logo.png")}/>
          <h1>Bitcoin Price</h1>
        </div>
        
        <Price />
        <Graph24h />
        <div></div>
          <a
            className="App-link"
            href="https://www.cryptocompare.com/api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Data by CryptoCompare. Prices are updated every minute.
          </a>
      </div>
    );
  }
}

class Price extends Component {

  constructor(props){
    super(props);
    this.state = { updates: 0, priceData : 0, class: "same", lastPrice: 0 };
    
  }

  tick() {
    
    this.setState(prevState => ({
      updates: prevState.updates + 1
    }));
    

    this.loadPrice();
    this.priceAnimation();
    
  }

  loadPrice(){
    //var lastPrice = this.state.priceData;
    var price_url = 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=BRL';
    fetch(price_url)
      .then(d => d.json())
      .then(d => {
        this.setState({
          lastPrice: this.state.priceData,
          priceData: d["BRL"]
          
        })
      })
  }

  priceAnimation(){
      let lastPrice = this.state.lastPrice
      let price = this.state.priceData;
      let newClass = "";
      if(lastPrice<price){
        newClass = "rise";
      }else if(lastPrice == price){
        newClass = "same";
      }else{
        newClass = "down";
      }
      this.setState(prevState => ({
        class: newClass
      }));

  }
    
  

  componentDidMount(){

      this.loadPrice();
      this.interval = setInterval(() => this.tick(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

 
  render() {
    if(!this.state.priceData) return <p>Loading...</p>;

    return (
      <div className="price">
        <h3>Price Now</h3>
        
        <div className={"btc-price "+this.state.class}>
          <p><NumberFormat value={this.state.priceData} displayType={'text'} decimalScale={2} prefix={'R$'} /></p>
        </div>
      </div>


    );
  }


}


class Graph24h extends Component{

  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    return(
      <div className={'graph'}>
        <h3>Last 24 hours</h3>
        <Chart data={data} width={width} height={height} />
      </div>
    );

  }
}

var data = [
  {a: 1, b: 3},
  {a: 2, b: 6},
  {a: 3, b: 2},
  {a: 4, b: 12},
  {a: 5, b: 8}
]
class Chart extends React.Component {

  constructor(props){
    super(props);
    this.state = { priceData:  [
      {a: 1, b: 3},
      {a: 2, b: 6},
      {a: 3, b: 2},
      {a: 4, b: 12},
      {a: 5, b: 8}] };
  }
  

  componentDidMount(){
    let now = Math.round((new Date()).getTime() / 1000);
    var price_24h_url = 'https://min-api.cryptocompare.com/data/histohour?fsym=BTC&tsym=BRL&limit=23';
    fetch(price_24h_url)
      .then(d => d.json())
      .then(d => {

        var priceData = [];


        Object.keys(d.Data).forEach(
          function(key) {
            let date = new Date(d.Data[key]["time"] * 1000);
            let nowData = {b: d.Data[key]["close"], 
                           a: date
                          };
            priceData.push(nowData);
          }
        ); 

        this.setState({
          priceData: priceData
        })
        console.log(priceData);
      
        
      
      })
      

  }

  render() {
    
    const {width, height} = this.props
    var data = this.state.priceData; 

    const h = height - 2 * margin, w = width - 2 * margin

    //number formatter
    const xFormat = d3.format('.5')
    
    //x scale
    /*const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.a)) //domain: [min,max] of a
      .range([margin, w])*/

    const x = d3.scaleTime()
    .domain([d3.min(data, d => d.a), d3.max(data, d => d.a)])    // values between for month of january
    .range([margin, w]); 

    
    //y scale
    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.b)-50, d3.max(data, d => d.b)]) // domain [0,max] of b (start from 0)
      .range([h, margin])
    
    //line generator: each point is [x(d.a), y(d.b)] where d is a row in data
    // and x, y are scales (e.g. x(10) returns pixel value of 10 scaled by x)
    const line = d3.line()
      .x(d => x(d.a))
      .y(d => y(d.b))
      .curve(d3.curveCatmullRom.alpha(0.5)) //curve line
     
    const xTicks = x.ticks(14).map(d => (
        x(d) > margin && x(d) < w ? 
          <g transform={`translate(${x(d)},${h + margin})`}>  
            <text>{moment(d).format('HH:mm')}</text>
            <line x1='0' x1='0' y1='0' y2='5' transform="translate(0,-20)"/>
          </g>
        : null
    ))

    const yTicks = y.ticks(10).map(d => (
        y(d) > 10 && y(d) < h ? 
          <g transform={`translate(${margin},${y(d)})`}>  
            <text x="-25" y="5">{xFormat(d)}</text>
            <line x1='0' x1='5' y1='0' y2='0' transform="translate(-5,0)"/>
            <line className='gridline' x1='0' x1={w - margin} y1='0' y2='0' transform="translate(-5,0)"/> 
          </g>
        : null
    ))

    return  (
      <svg width={width} height={height}>
         <line className="axis" x1={margin} x2={w} y1={h} y2={h}/>
         <line className="axis" x1={margin} x2={margin} y1={margin} y2={h}/>
         <path d={line(data)}/>
         <g className="axis-labels">
           {xTicks}
         </g>
         <g className="axis-labels">
           {yTicks}
         </g>
      </svg>
    )
  }
}

 const width = 800, height = 350, margin = 25
 

export default App;

