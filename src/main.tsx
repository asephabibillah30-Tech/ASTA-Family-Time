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

// Force unregister stale PWA service workers to ensure immediate live updates
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

