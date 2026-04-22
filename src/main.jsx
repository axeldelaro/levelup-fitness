import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { useGameStore } from './stores/gameStore'

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", message, error);
  useGameStore.getState().addNotification({
    type: 'error',
    message: `Erreur: ${message}`
  });
  return false;
};

window.onunhandledrejection = function (event) {
  console.error("Unhandled Promise Rejection:", event.reason);
  useGameStore.getState().addNotification({
    type: 'error',
    message: `Erreur Réseau/Async: ${event.reason?.message || 'Erreur inconnue'}`
  });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
