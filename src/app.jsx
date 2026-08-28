import { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding.jsx';
import RecentFeed from './components/RecentFeed.jsx';
import Collections from './components/Collections.jsx';
import Favorites from './components/Favorites.jsx';
import Settings from './components/Settings.jsx';
import SearchView from './components/SearchView.jsx';

const api = window.copycat;

const NAV_ITEMS = [
  { id: 'search',      label: 'Search',      icon: '🔍', shortcut: '⌘K' },
  { id: 'recent',      label: 'Recent',      icon: '🕐', shortcut: null  },
  { id: 'collections', label: 'Collections', icon: '🗂', shortcut: null  },
  { id: 'favorites',   label: 'Favorites',   icon: '⭐', shortcut: null  },
  { id: 'settings',    label: 'Settings',    icon: '⚙️', shortcut: null  },
];

export default function App() {
  const [activeView, setActiveView] = useState('recent');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [monitorStatus, setMonitorStatus] = useState({ isRunning: true, isPaused: false });
  const [newItemFlash, setNewItemFlash] = useState(null);

  useEffect(() => {
    // Check if first launch
    const hasOnboarded = localStorage.getItem('copycat-onboarded');
    if (!hasOnboarded) {
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">🐱</div>
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
              {item.shortcut && <span className="nav-shortcut">{item.shortcut}</span>}
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
