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

  /*
  return (
    <div className="inner_float">
      <div className="icondiv"><img src={require("./img/" + props.icon)} className="icon" alt={props.text}/></div>
      <span className="icontext" style={props.style}> {props.text}</span>
    </div>
  )
    */
}

class Entry extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    let data = this.props.data;
    var format = require('format-number');
    let lohn = data.lohn ? format({ suffix: '.-', integerSeparator : "'"})(data.lohn, {noSeparator: false}) : '';

    return (
      <div className="container">
        <div className="cell container_image">
          <img src={require("./logos/20min.png")} alt="logos/tmp.png" className="image_medium" />
        </div>
        <div className="cell container_right">
          <p className="medium">{data.medium} - {data.ressort}</p>

          <Line title='Lohn' text={lohn}/>
          <Line title='Sozialleistungen' text={data.sozialleistungen} />
          <Line title='Spesen' text={data.spesen} />
          <Line title='Abrechnung' text={data.abrechnung} />
          <Line title='Auftrag' text={data.auftrag} />
          <Line title='Zeichen' text={data.zeichen} />
          <Line title='Infos' text={data.infos} />

        </div>
      </div>
      
    )
  }
}


function List(props)
{
  let entries = props.data.data.map((item, step) => {
    return (
      <Entry key={step} data={item}/>
    )
  });
/*
  const moves = history.map((step, move) => {
    const desc = move ?
      'Go to move #' + move :
      'Go to game start';
    return (
      <li>
        <button onClick={() => this.jumpTo(move)}>{desc}</button>
      </li>
    );
  });
  */

  return (
    <div id='listBox'>
      {entries}
    </div>
  )
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
    console.log("monut");
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
    )
  }

  render()
  {
    console.log("render");
    const { error, isLoaded, data } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {

      return (
        <div>
          <p id='leadin'></p>
          <List data={data}/>
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
