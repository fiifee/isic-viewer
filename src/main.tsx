import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Hide status bar on native apps (only works in Capacitor)
try {
  import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.hide();
  });
} catch {}

// Register service worker for offline PWA support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
