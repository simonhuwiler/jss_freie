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
  let lohn = data.lohn && !isNaN(data.lohn) ? format({ suffix: '.-', integerSeparator : "'"})(data.lohn, {noSeparator: false}) : data.lohn;

  return (
    <div className='job'>
      {data.offiziell === true &&
        <div className='line_title'>Offizielle Angaben</div>
      }
      <Line title='Jahr' text={data.jahr} offiziell={data.offiziell}/>
      <Line title='Länge' text={data.zeichen}  offiziell={data.offiziell}/>
      <Line title='Lohn brutto' text={lohn} offiziell={data.offiziell}/>
      <Line title='Sozialleistungen' text={data.sozialleistungen} offiziell={data.offiziell}/>
      <Line title='Spesen' text={data.spesen} offiziell={data.offiziell}/>
      <Line title='Abrechnung' text={data.abrechnung} offiziell={data.offiziell}/>
      <Line title='Auftrag' text={data.auftrag} offiziell={data.offiziell}/>
      <Line title='Infos' text={data.infos} offiziell={data.offiziell}/>
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

  let ressort = props.name ? props.name : "Ohne Ressortangabe";
  let display = props.visible === true ?  {} : {display: 'none'};

  return (
    <div style={display}>
      <h2>{ressort}</h2>
      {jobs}
    </div>
  )
}

function Medium(props)
{
  let data = props.data;
  let display = data.visible === true ?  {} : {display: 'none'};

  //Map Ressorts
  let ressorts = props.data.ressorts.map((item, step) => {
    return (
      <Ressort key={item.name} visible={item.visible} name={item.name} jobs={item.jobs}/>
    )
  });

  return (
    <div className="container" style={display}>
      <div className="cell container_image">
        <img src={images[data.logo + '.png']} alt={images[data.logo + '.png']} className="image_medium" />
      </div>
      <div className="container_image_cropped">
        <img src={images[data.logo + '.png']} alt={images[data.logo + '.png']} className="image_medium" />
      </div>
      <div className="cell container_right">
        <h1>{data.name}</h1>
        {data.text_offiziell &&

          <div className='info_offiziell'>
            Offizielle Angaben<br />
            <div className='info_offiziell_text'>
              {data.text_offiziell.split('\n').map((item, key) => {
                return <span key={key}>{item}<br/></span>
              })}
            </div>
          </div>
        }
        {ressorts}
      </div>
    </div>
  )
}

function List(props)
{
  let entries = props.data.map((item, step) => {
    
    return (
      <Medium key={step} data={item}/>
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

  allVisibleToTrue(data)
  {
    for(let medium in data)
    {
      data[medium].visible = true;
      for(let ressort in data[medium].ressorts)
      {
        data[medium].ressorts[ressort].visible = true;
        /*
        for(let job in data[medium].ressorts[ressort].jobs)
        {
          data[medium].ressorts[ressort].jobs[job].visible = true;
        }
        */
      }
    };
    return data;
  }

  componentDidMount()
  {
    fetch("data/data_bulk.json")
    .then(res => res.json())
    .then(
      (result) => {

        //Add visible = true
        result = this.allVisibleToTrue(result);

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
    key = key.toLowerCase();

    //First: Set every visible to true
    let data = this.allVisibleToTrue(this.state.data);

    //Second: Search in data for medium and ressort
    if(key && key !== "")
    {
      for(let i_medium in data)
      {
        let medium = data[i_medium];
        medium.visible = medium.name.toLowerCase().indexOf(key) >= 0;

        //if v_medium == false, check, if ressorts are in search string
        if(!medium.visible)
        {
          for(let i_ressort in medium.ressorts)
          {
            let ressort = medium.ressorts[i_ressort];
            ressort.visible = ressort.name.toLowerCase().indexOf(key) >= 0;

            //If ressort is in search string, change medium.visible to true
            if(ressort.visible)
            {
              medium.visible = true;
            }

          }
        }
      }
    }

    this.setState({data: data});
  }

  render()
  {
    const { error, isLoaded, data } = this.state;
    if (error) {
      return <div>Ups, da ist ein Fehler aufgetreten. Tut uns leit! {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Wird geladen...</div>;
    } else {

      return (
        <div>
          <Search onSearch={e => this.search(e)}/>
          <p id='leadin'></p>
          <List data={data}/>
        </div>
      )
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