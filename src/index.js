import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './style.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// Disable console logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  // keep console.error to show real errors
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
