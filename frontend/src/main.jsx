import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import { getStoredTheme, registerServiceWorker, setTheme } from './pwa'

// Initialize the app theme and register the service worker for offline/PWA support.
setTheme(getStoredTheme())
registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
