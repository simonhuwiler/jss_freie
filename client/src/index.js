import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';

function Line(props)
{
  if(!props.text)
    return ""
  else
  {
    return (
      <div className='line'>
        <div>{props.title}</div>
        <div>{props.text}</div>
      </div>
    )
  }
}

function Job(props)
{
  let data = props.data;
  var format = require('format-number');
  let lohn = data.lohn ? format({ suffix: '.-', integerSeparator : "'"})(data.lohn, {noSeparator: false}) : '';
  return (
    <div className='job'>
      <Line title='Jahr' text={data.jahr} bold="1"/>
      <Line title='Lohn' text={lohn}/>
      <Line title='Sozialleistungen' text={data.sozialleistungen} />
      <Line title='Spesen' text={data.spesen} />
      <Line title='Abrechnung' text={data.abrechnung} />
      <Line title='Auftrag' text={data.auftrag} />
      <Line title='Zeichen' text={data.zeichen} />
      <Line title='Infos' text={data.infos} />
    </div>
  )
}

function Ressort(props)
{

  //Map Jobs
  let jobs = props.jobs.map((item, step) => {
    return (
      <Job key={step} data={item}/>
    )
  });

  let ressort = props.name ? <h2>{props.name}</h2> : "";

  return (
    <div>
      {ressort}
      {jobs}
    </div>
  )
}

function Medium(props)
{
  let data = props.data;
  let display = props.visible === true ?  {} : {display: 'none'};

  //Map Ressorts
  let ressorts = props.data.ressorts.map((item, step) => {
    return (
      <Ressort key={item.name} name={item.name} jobs={item.jobs}/>
    )
  });

  return (
    <div className="container" style={display}>
      <div className="cell container_image">
        <img src={images[data.logo + '.png']} alt={images[data.logo + '.png']} className="image_medium" />
      </div>
      <div className="cell container_right">
        <h1>{data.name}</h1>
        {ressorts}
      </div>
    </div>
  )
  /*
          <Line title='Jahr' text={data.jahr}/>
        <Line title='Lohn' text={lohn}/>
        <Line title='Sozialleistungen' text={data.sozialleistungen} />
        <Line title='Spesen' text={data.spesen} />
        <Line title='Abrechnung' text={data.abrechnung} />
        <Line title='Auftrag' text={data.auftrag} />
        <Line title='Zeichen' text={data.zeichen} />
        <Line title='Infos' text={data.infos} />
        */
}

function List(props)
{
  let entries = props.data.map((item, step) => {
    let visible = true;
    if(props.search && props.search !== "")
    {
      let s = props.search.toLowerCase();
      visible = item.name.toLowerCase().indexOf(s) >= 0/* || item.ressort.toLowerCase().indexOf(s) >= 0*/ ? true : false;
    }
    return (
      <Medium key={step} data={item} visible={visible}/>
    )
  });

  return (
    <div>
      <div id='listBox'>
        {entries}
      </div>
    </div>
  )
}

class Search extends React.Component
{
  constructor(props)
  {
    super(props);
    this.onSearch = props.onSearch;
    this.state = {
      search: ""
    }
  }

  onChange(event)
  {
    clearInterval(this.interval);
    let interval = setInterval(() => {
      clearInterval(interval);
      this.onSearch(this.state.search);
    }, 500);
    this.interval = interval;
    this.setState({search: event.target.value});
  }

  render()
  {
    return (
      <div className="search">
        <input id="typesearch" type="text" value={this.state.search} name="search" placeholder="Suchen" onChange={this.onChange.bind(this)}/>
      </div>
    )
  }
}

class Form extends React.Component
{

  constructor(props)
  {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount()
  {
    fetch("data/data_bulk.json")
    .then(res => res.json())
    .then(
      (result) => {

          this.setState({
            isLoaded: true,
            data: result
          });
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    );
  }

  search(key)
  {
    this.setState({search: key})
  }

  render()
  {
    const { error, isLoaded, data } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {

      return (
        <div>
          <Search onSearch={e => this.search(e)}/>
          <p id='leadin'></p>
          <List data={data} search={this.state.search}/>
        </div>
      )

      //console.log(data);
      //return ("Hallo");
    }
  }
}


// ========================================

ReactDOM.render(
  <Form />,
  document.getElementById('root')
);

const importAll = require =>
require.keys().reduce((acc, next) => {
  acc[next.replace("./", "")] = require(next);
  return acc;
}, {});

const images = importAll(
  require.context("./logos", false, /\.(png|jpe?g|svg)$/)
);