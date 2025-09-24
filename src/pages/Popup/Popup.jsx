import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  return (
    <body>
      <div className='Main-Container'>
        <div className="Button-Container">
          <button>View</button>
          <button>Chat</button>
        </div>
        <div>
          <div className="Interactive-Interface"></div>
        </div>
      </div>
    </body>
  );
};
{/* </div>
    <div className="App">
      <header className="App-header">
        
      </header>
    </div> */}
export default Popup;
