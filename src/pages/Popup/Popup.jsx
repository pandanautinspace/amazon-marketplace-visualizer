import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  return (
    <div className="absolute inset-0 text-center h-full p-2.5 bg-gray-800">
      <header className="h-full flex flex-col items-center justify-center text-white text-lg">
        <img src={logo} className="h-32 pointer-events-none animate-spin" alt="logo" style={{ animationDuration: '20s' }} />
        <p className="mb-4">
          Edit <code className="bg-gray-700 px-1 rounded">src/pages/Popup/Popup.jsx</code> and save to reload.
        </p>
        <a
          className="text-blue-400 hover:text-blue-300 transition-colors"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <div className="mt-4 text-sm text-green-400">
          ✅ Tailwind CSS is working!
        </div>
      </header>
    </div>
  );
};

export default Popup;
