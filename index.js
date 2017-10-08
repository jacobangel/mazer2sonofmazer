import React from 'react';
import ReactDOM from 'react-dom';
import App from './src/App.jsx';

let render = () => {
  ReactDOM.render(
    <App />,
    document.querySelector('#root')
  );
}

render();