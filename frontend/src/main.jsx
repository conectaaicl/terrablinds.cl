import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Versioned URL: Cloudflare cached the bare /sw.js for a year, so bumping
        // this query is what actually ships a new worker. Bump it on every sw.js change.
        navigator.serviceWorker.register('/sw.js?v=3').catch(() => {});
    });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
