import { useState, useEffect } from 'react';

const api = window.copycat;

export default function Settings({ monitorStatus, setMonitorStatus }) {
  const [settings, setSettings] = useState({
    captureEnabled: true,
    shortcut: 'Ctrl+Shift+V',
    autoDelete: 'never',
    excludedApps: [],
    maxItems: 10000,
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!api) return;
    api.getSettings().then(s => setSettings(s || settings));
  }, []);

  async function toggleCapture() {
    const newEnabled = !settings.captureEnabled;
    setSettings(s => ({ ...s, captureEnabled: newEnabled }));
    if (api) {
      if (newEnabled) {
        await api.resumeMonitor();
        setMonitorStatus(s => ({ ...s, isPaused: false }));
      } else {
        await api.pauseMonitor('forever');
        setMonitorStatus(s => ({ ...s, isPaused: true }));
      }
      await api.saveSetting('captureEnabled', newEnabled);
    }
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    if (api) await api.clearAll();
    setConfirmClear(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveSetting(key, value) {
    setSettings(s => ({ ...s, [key]: value }));
    if (api) await api.saveSetting(key, value);
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Settings</h1>
          <div className="content-subtitle">Manage Copycat preferences and privacy</div>
        </div>
      </div>

      <div className="content-scroll">
        <div className="settings-container">
          {/* Privacy Banner */}
          <div className="privacy-banner">
            <span className="privacy-icon">🔒</span>
            <div className="privacy-text">
              <strong>Private by default.</strong> All clipboard data stays on your device. 
              Nothing is sent to any server or cloud service.
            </div>
          </div>

          {/* Capture */}
          <div className="settings-section">
            <div className="settings-section-title">Capture</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Enable clipboard capture</div>
                <div className="settings-description">Monitor and save clipboard changes automatically</div>
              </div>
              <div
                id="toggle-capture"
                className={`toggle ${settings.captureEnabled ? 'on' : ''}`}
                onClick={toggleCapture}
              />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Auto-delete after</div>
                <div className="settings-description">Automatically remove old memories</div>
              </div>
              <select
                value={settings.autoDelete}
                onChange={e => saveSetting('autoDelete', e.target.value)}
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <option value="never">Never</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
              </select>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Max stored items</div>
                <div className="settings-description">Older items deleted when limit reached</div>
              </div>
              <select
                value={settings.maxItems}
                onChange={e => saveSetting('maxItems', parseInt(e.target.value))}
                style={{
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <option value={1000}>1,000</option>
                <option value={5000}>5,000</option>
                <option value={10000}>10,000</option>
                <option value={50000}>50,000</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
          </div>

          {/* Exclusions */}
          <div className="settings-section">
            <div className="settings-section-title">Exclusions</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Exclude password managers</div>
                <div className="settings-description">Never capture from 1Password, Bitwarden, Keychain, etc.</div>
              </div>
              <div className="toggle on" style={{ cursor: 'default' }} title="Always enabled" />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Skip sensitive patterns</div>
                <div className="settings-description">Auto-detect and skip private keys, credit cards, passwords</div>
              </div>
              <div className="toggle on" style={{ cursor: 'default' }} title="Always enabled" />
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-label">Excluded applications</div>
                <div className="settings-description">Clipboard from these apps won't be captured</div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 11 }}>Manage</button>
            </div>
          </div>

          {/* Shortcut */}
          <div className="settings-section">
            <div className="settings-section-title">Keyboard Shortcut</div>
            <div className="settings-row">
              <div>
                <div className="settings-label">Open search overlay</div>
                <div className="settings-description">Global shortcut to open Copycat from anywhere</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Ctrl', 'Shift', 'V'].map(k => (
                  <span key={k} className="kbd" style={{ fontSize: 12, padding: '4px 8px' }}>{k}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="settings-section">
            <div className="settings-section-title">Data & Privacy</div>

            <div className="settings-row">
              <div>
                <div className="settings-label">View stored data</div>
                <div className="settings-description">See exactly what Copycat has captured</div>
              </div>
              <button className="btn btn-ghost" style={{ fontSize: 11 }}
                onClick={() => {}}>
                Open Recent →
              </button>
            </div>

            <div className="settings-row" style={{ paddingTop: 16 }}>
              <div>
                <div className="settings-label" style={{ color: 'var(--accent-red)' }}>
                  Delete all memories
                </div>
                <div className="settings-description">
                  {confirmClear
                    ? '⚠️ This cannot be undone. Click again to confirm.'
                    : 'Permanently delete your entire clipboard history'
                  }
                </div>
              </div>
              <button
                id="btn-clear-all"
                className="btn btn-danger"
                style={{ fontSize: 11 }}
                onClick={handleClearAll}
              >
                {confirmClear ? '⚠️ Confirm Delete' : 'Delete All'}
              </button>
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <div className="settings-section-title">About</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-mint))',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>
                  🐱
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Copycat</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Version 1.0.0</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Copy it once. Find it forever.<br />
                Your AI clipboard that never forgets.
              </div>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="copied-flash">
          <span className="toast-dot" />
          Changes saved
        </div>
      )}
    </>
  );
}
