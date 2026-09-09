import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Register PWA service worker and auto update immediately
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

