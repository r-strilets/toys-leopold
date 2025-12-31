
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill для об'єкта process, щоб доступ до process.env.API_KEY не викликав помилок у браузері
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' // Буде автоматично замінено середовищем виконання
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
