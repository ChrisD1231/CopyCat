import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding.jsx';
import RecentFeed from './components/RecentFeed.jsx';
import Collections from './components/Collections.jsx';
import Favorites from './components/Favorites.jsx';
import Settings from './components/Settings.jsx';
import SearchView from './components/SearchView.jsx';

import { Icons } from './components/Icons.jsx';

const api = window.copycat;

const NAV_ITEMS = [
  { id: 'search',      label: 'Search',      icon: <Icons.Search />, shortcut: 'Ctrl+F' },
  { id: 'recent',      label: 'Recent',      icon: <Icons.Clock />, shortcut: null  },
  { id: 'collections', label: 'Collections', icon: <Icons.Folder />, shortcut: null  },
  { id: 'favorites',   label: 'Favorites',   icon: <Icons.Star />, shortcut: null  },
  { id: 'settings',    label: 'Settings',    icon: <Icons.Settings />, shortcut: null  },
];

export default function App() {
  const [activeView, setActiveView] = useState('recent');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [monitorStatus, setMonitorStatus] = useState({ isRunning: true, isPaused: false });
  const [newItemFlash, setNewItemFlash] = useState(null);

  useEffect(() => {
    // Check if first launch (only show landing page in browser preview)
    const hasOnboarded = localStorage.getItem('copycat-onboarded');
    if (!api && !hasOnboarded) {
      setShowOnboarding(true);
    }

    // Listen for new clipboard items
    if (api) {
      const unsub = api.onNewItem((item) => {
        setNewItemFlash(item);
        setTimeout(() => setNewItemFlash(null), 2000);
      });
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (api) {
      api.getMonitorStatus().then(setMonitorStatus);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('copycat-onboarded', 'true');
    setShowOnboarding(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'search':      return <SearchView />;
      case 'recent':      return <RecentFeed />;
      case 'collections': return <Collections />;
      case 'favorites':   return <Favorites />;
      case 'settings':    return <Settings monitorStatus={monitorStatus} setMonitorStatus={setMonitorStatus} />;
      default:            return <RecentFeed />;
    }
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-shell">
      <div className="window-drag-handle" />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark"><Icons.Logo style={{ width: 14, height: 14 }} /></div>
          <div>
            <div className="logo-text">Copycat</div>
            <div className="logo-tagline">Copy it once. Find it forever.</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.shortcut && <span className="kbd">{item.shortcut}</span>}
            </button>
          ))}
        </nav>

        {/* Capture status at bottom of sidebar */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="status-indicator">
            <div className={`status-dot ${monitorStatus.isPaused ? 'paused' : ''}`} />
            <span>{monitorStatus.isPaused ? 'Capture paused' : 'Capturing'}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* New item toast */}
      {newItemFlash && (
        <div className="copied-flash">
          <span className="toast-dot" />
          Captured: {newItemFlash.title || newItemFlash.content?.substring(0, 30)}
        </div>
      )}
    </div>
  );
}
