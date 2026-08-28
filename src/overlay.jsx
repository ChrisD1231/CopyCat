import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import FloatingSearch from './components/Overlay/FloatingSearch.jsx';

ReactDOM.createRoot(document.getElementById('overlay-root')).render(
  <React.StrictMode>
    <FloatingSearch />
  </React.StrictMode>
);
