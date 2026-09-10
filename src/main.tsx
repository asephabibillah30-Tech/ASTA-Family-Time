import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Runtime title & branding enforcement
const APP_TITLE = 'ASTA Family Time - Satu aplikasi, lebih banyak waktu bersama keluarga.';
if (typeof document !== 'undefined') {
  document.title = APP_TITLE;
}

// Register PWA service worker and auto update immediately
registerSW({ 
  immediate: true,
  onNeedRefresh() {
    console.log('PWA updated to latest version.');
    window.location.reload();
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

