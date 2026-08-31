import { useState, useEffect } from 'react';
import { Icons } from './Icons.jsx';

const api = window.copycat;

const DEFAULT_EXCLUDED = [
  '1Password.exe',
  'Bitwarden.exe',
  'KeePass.exe',
  'KeePassXC.exe',
  'Dashlane.exe',
  'chrome.exe (Incognito)',
];

const AVAILABLE_SHORTCUTS = [
  { id: 'Alt+C', label: 'Alt + C (Recommended)' },
  { id: 'Alt+V', label: 'Alt + V' },
  { id: 'CommandOrControl+Shift+V', label: 'Ctrl + Shift + V' },
  { id: 'CommandOrControl+Space', label: 'Ctrl + Space' },
  { id: 'Alt+Space', label: 'Alt + Space' },
];

const COMMUNITY_THEMES = [
  {
    id: 'zinc',
    name: 'Zinc Stealth',
    tag: 'Default',
    desc: 'Clean monochromatic dark mode',
    swatches: ['#09090b', '#18181b', '#fafafa', '#22c55e'],
    accent: '#fafafa',
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    tag: 'Community',
    desc: 'Soothing pastel dark aesthetic',
    swatches: ['#1e1e2e', '#181825', '#cba6f7', '#a6e3a1'],
    accent: '#cba6f7',
  },
  {
    id: 'dracula',
    name: 'Dracula Pro',
    tag: 'Popular',
    desc: 'Vibrant gothic dark theme',
    swatches: ['#282a36', '#21222c', '#bd93f9', '#50fa7b'],
    accent: '#bd93f9',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    tag: 'Cyberpunk',
    desc: 'Neon Tokyo evening palette',
    swatches: ['#1a1b26', '#16161e', '#7aa2f7', '#bb9af7'],
    accent: '#7aa2f7',
  },
  {
    id: 'nord',
    name: 'Nord Arctic',
    tag: 'Clean',
    desc: 'Arctic, north-bluish palette',
    swatches: ['#242933', '#2e3440', '#88c0d0', '#a3be8c'],
    accent: '#88c0d0',
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    tag: 'Classic',
    desc: 'Precision balanced low-contrast',
    swatches: ['#002b36', '#073642', '#2aa198', '#268bd2'],
    accent: '#2aa198',
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    tag: 'Vibrant',
    desc: 'Rich syntax-focused palette',
    swatches: ['#221f22', '#2d2a2e', '#ffd866', '#ff6188'],
    accent: '#ffd866',
  },
];

export default function Settings({ monitorStatus, setMonitorStatus, setActiveView }) {
  const [settings, setSettings] = useState({
    theme: 'zinc',
    captureEnabled: true,
    shortcut: 'Alt+C',
    autoDelete: 'never',
    excludedApps: DEFAULT_EXCLUDED,
    excludePasswords: true,
    skipSensitive: true,
    maxItems: 10000,
  });
  const [showAppManager, setShowAppManager] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);

  useEffect(() => {
    if (!api) {
      // LocalStorage fallback for browser preview
      const local = localStorage.getItem('copycat_settings');
      if (local) {
        try { 
          const parsed = JSON.parse(local);
          setSettings(prev => ({ ...prev, ...parsed })); 
          if (parsed.theme) document.documentElement.setAttribute('data-theme', parsed.theme);
        } catch (e) {}
      }
      return;
    }
    api.getSettings().then(s => {
      if (s) {
        setSettings(prev => ({ ...prev, ...s }));
        if (s.theme) document.documentElement.setAttribute('data-theme', s.theme);
      }
    });
  }, []);

  const flashSaved = (msg = 'Settings saved') => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 2200);
  };

  async function saveSetting(key, value) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    if (api) {
      await api.saveSetting(key, value);
    } else {
      localStorage.setItem('copycat_settings', JSON.stringify(updated));
    }
    flashSaved();
  }

  const handleSelectTheme = (themeId, themeName) => {
    saveSetting('theme', themeId);
    flashSaved(`Applied ${themeName} theme`);
  };

  async function toggleCapture() {
    const newEnabled = !settings.captureEnabled;
    setSettings(s => ({ ...s, captureEnabled: newEnabled }));
    if (api) {
      if (newEnabled) {
        await api.resumeMonitor();
        if (setMonitorStatus) setMonitorStatus(s => ({ ...s, isPaused: false }));
      } else {
        await api.pauseMonitor('forever');
        if (setMonitorStatus) setMonitorStatus(s => ({ ...s, isPaused: true }));
      }
      await api.saveSetting('captureEnabled', newEnabled);
    }
    flashSaved(newEnabled ? 'Clipboard capture enabled' : 'Clipboard capture paused');
  }

  const handleAddExcludedApp = () => {
    if (!newAppName.trim()) return;
    const trimmed = newAppName.trim();
    if (settings.excludedApps.includes(trimmed)) return;
    const updated = [...settings.excludedApps, trimmed];
    saveSetting('excludedApps', updated);
    setNewAppName('');
  };

  const handleRemoveExcludedApp = (appToRemove) => {
    const updated = settings.excludedApps.filter(a => a !== appToRemove);
    saveSetting('excludedApps', updated);
  };

  const handleResetExcludedApps = () => {
    saveSetting('excludedApps', DEFAULT_EXCLUDED);
  };

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    if (api) {
      await api.clearAll();
    }
    setConfirmClear(false);
    flashSaved('All memories cleared');
  }

  async function handleExportJSON() {
    try {
      let items = [];
      if (api) {
        items = await api.getRecent(10000);
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `copycat_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      flashSaved('Export complete');
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Settings</h1>
          <div className="content-subtitle">Manage Copycat preferences, themes, and security</div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="settings-container">
          {/* Privacy Banner */}
          <div className="privacy-banner">
            <span className="privacy-icon"><Icons.Shield style={{ width: 14, height: 14 }} /></span>
            <div className="privacy-text">
              <strong>Private by default.</strong> All clipboard data is stored strictly on your local device in an offline SQLite database.
            </div>
          </div>

          {/* 1. Theme Engine Section */}
          <div className="settings-section">
            <div className="settings-section-title">Appearance & Themes</div>
            <div className="settings-description" style={{ marginBottom: 8 }}>
              Choose from community curated dark themes with synchronized UI tokens.
            </div>

            <div className="theme-grid">
              {COMMUNITY_THEMES.map(t => {
                const isActive = (settings.theme || 'zinc') === t.id;
                return (
                  <div
                    key={t.id}
                    className={`theme-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTheme(t.id, t.name)}
                    style={{ background: t.swatches[1] }}
                  >
                    <div className="theme-card-header">
                      <span className="theme-card-name" style={{ color: t.accent }}>{t.name}</span>
                      {isActive && <span className="theme-active-tag">Active</span>}
                    </div>

                    <div className="theme-swatches">
                      {t.swatches.map((color, idx) => (
                        <span key={idx} className="theme-swatch-dot" style={{ background: color }} />
                      ))}
                    </div>

                    <div className="theme-preview-canvas" style={{ background: t.swatches[0] }}>
                      <span className="theme-canvas-dot" style={{ background: t.accent }} />
                      <div className="theme-canvas-bar" style={{ background: `${t.accent}30` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Capture Section */}
          <div className="settings-section">
            <div className="settings-section-title">Capture & Retention</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Enable clipboard capture</div>
                <div className="settings-description">Monitor and save clipboard changes automatically in the background</div>
              </div>
              <div
                id="toggle-capture"
                className={`toggle ${settings.captureEnabled ? 'on' : ''}`}
                onClick={toggleCapture}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Auto-delete history after</div>
                <div className="settings-description">Automatically purge old memory records</div>
              </div>
              <select
                value={settings.autoDelete}
                onChange={e => saveSetting('autoDelete', e.target.value)}
                className="settings-select"
              >
                <option value="never">Never (Keep Forever)</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
              </select>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Max stored items</div>
                <div className="settings-description">Older items are pruned when limit is reached</div>
              </div>
              <select
                value={settings.maxItems}
                onChange={e => saveSetting('maxItems', parseInt(e.target.value))}
                className="settings-select"
              >
                <option value={1000}>1,000 memories</option>
                <option value={5000}>5,000 memories</option>
                <option value={10000}>10,000 memories</option>
                <option value={50000}>50,000 memories</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
          </div>

          {/* 3. Exclusions Section */}
          <div className="settings-section">
            <div className="settings-section-title">Exclusions & Security Shield</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Exclude password managers</div>
                <div className="settings-description">Never capture clips from 1Password, Bitwarden, KeePass, Dashlane</div>
              </div>
              <div
                className={`toggle ${settings.excludePasswords ? 'on' : ''}`}
                onClick={() => saveSetting('excludePasswords', !settings.excludePasswords)}
                style={{ cursor: 'pointer' }}
                title="Click to toggle"
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Skip sensitive patterns</div>
                <div className="settings-description">Auto-detect and discard private keys, Stripe secrets, tokens, credit cards</div>
              </div>
              <div
                className={`toggle ${settings.skipSensitive ? 'on' : ''}`}
                onClick={() => saveSetting('skipSensitive', !settings.skipSensitive)}
                style={{ cursor: 'pointer' }}
                title="Click to toggle"
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Excluded applications</div>
                <div className="settings-description">
                  {settings.excludedApps.length} application(s) blacklisted from capture
                </div>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => setShowAppManager(!showAppManager)}
              >
                {showAppManager ? 'Hide Apps' : 'Manage Apps →'}
              </button>
            </div>

            {/* Excluded Apps Inline Manager */}
            {showAppManager && (
              <div className="excluded-apps-panel">
                <div className="excluded-apps-header">
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Blacklisted Processes
                  </span>
                  <button 
                    onClick={handleResetExcludedApps} 
                    className="btn btn-ghost" 
                    style={{ fontSize: 10, padding: '2px 8px' }}
                  >
                    Reset Defaults
                  </button>
                </div>

                <div className="excluded-tags-grid">
                  {settings.excludedApps.map((app) => (
                    <div key={app} className="excluded-app-chip">
                      <Icons.Shield style={{ width: 11, height: 11, opacity: 0.7 }} />
                      <span>{app}</span>
                      <button 
                        className="chip-remove-btn" 
                        onClick={() => handleRemoveExcludedApp(app)}
                        title="Remove exclusion"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="add-app-row">
                  <input
                    type="text"
                    placeholder="Enter process name (e.g. telegram.exe, slack.exe)..."
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExcludedApp()}
                    className="add-app-input"
                  />
                  <button 
                    onClick={handleAddExcludedApp}
                    className="btn btn-primary"
                    style={{ fontSize: 11, padding: '6px 12px' }}
                  >
                    + Add Process
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Keyboard Shortcut Section */}
          <div className="settings-section">
            <div className="settings-section-title">Global Keyboard Shortcut</div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Open floating search overlay</div>
                <div className="settings-description">Global hotkey to invoke Copycat HUD from inside any app</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select
                  value={settings.shortcut}
                  onChange={(e) => saveSetting('shortcut', e.target.value)}
                  className="settings-select"
                >
                  {AVAILABLE_SHORTCUTS.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Data & Privacy Management */}
          <div className="settings-section">
            <div className="settings-section-title">Data & Privacy Management</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">View clipboard feed</div>
                <div className="settings-description">Jump directly to your captured memories and search index</div>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => setActiveView && setActiveView('recent')}
              >
                Open Recent Feed →
              </button>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Export clipboard archive</div>
                <div className="settings-description">Download your history as a portable JSON file</div>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={handleExportJSON}
              >
                Export JSON 📥
              </button>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">App onboarding tour</div>
                <div className="settings-description">Revisit the product showcase landing page</div>
              </div>
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => {
                  localStorage.removeItem('copycat-onboarded');
                  window.location.reload();
                }}
              >
                Replay Tour
              </button>
            </div>

            <div className="settings-row" style={{ paddingTop: 16 }}>
              <div>
                <div className="settings-label" style={{ color: 'var(--accent-red)' }}>
                  Purge all clipboard data
                </div>
                <div className="settings-description">
                  {confirmClear
                    ? '⚠️ Warning: This will permanently delete your entire local database. Click again to confirm.'
                    : 'Permanently remove all captured clips and search embeddings'
                  }
                </div>
              </div>
              <button
                id="btn-clear-all"
                className="btn btn-danger"
                style={{ fontSize: 11, padding: '6px 14px' }}
                onClick={handleClearAll}
              >
                {confirmClear ? 'Confirm Permanent Delete' : 'Purge All Memories'}
              </button>
            </div>
          </div>

          {/* 6. About */}
          <div className="settings-section">
            <div className="settings-section-title">About Copycat</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: '#18181b',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}>
                  <Icons.Logo style={{ width: 22, height: 22, color: '#ffffff' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff' }}>Copycat Desktop</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>v1.0.0 · Local-First WebAssembly SQLite Engine</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Copy it once. Find it forever.<br />
                Crafted for developer speed with zero cloud telemetry.
              </div>
            </div>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="copied-flash">
          <span className="toast-dot" />
          {savedMessage}
        </div>
      )}
    </>
  );
}
