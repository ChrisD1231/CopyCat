import React, { useState } from 'react';
import { Icons } from './Icons.jsx';

export default function Onboarding({ onComplete }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);
  const [copiedToast, setCopiedToast] = useState(null);
  const [demoQuery, setDemoQuery] = useState('');

  const DEMO_CLIPS = [
    {
      id: 1,
      type: 'code',
      title: 'GSAP ScrollTrigger Animation Script',
      preview: 'gsap.to(".hero-card", { scrollTrigger: ".trigger", y: 0, opacity: 1 });',
      time: '2 mins ago',
      tag: 'JavaScript',
      badge: 'Code',
      icon: <Icons.Code style={{ width: 14, height: 14 }} />
    },
    {
      id: 2,
      type: 'color',
      title: 'Zinc Dark Surface Tone',
      preview: '#18181b — rgba(24, 24, 27, 1)',
      time: '14 mins ago',
      tag: 'Palette',
      badge: 'Color',
      color: '#18181b',
      icon: <Icons.Color style={{ width: 14, height: 14 }} />
    },
    {
      id: 3,
      type: 'url',
      title: 'Aceternity UI — Modern Component Library',
      preview: 'https://ui.aceternity.com/components/bento-grid',
      time: '1 hour ago',
      tag: 'Resource',
      badge: 'Link',
      icon: <Icons.Link style={{ width: 14, height: 14 }} />
    },
    {
      id: 4,
      type: 'prompt',
      title: 'System prompt for technical code reviewer',
      preview: 'You are an expert full-stack engineer doing high-priority PR audits...',
      time: '3 hours ago',
      tag: 'AI Prompt',
      badge: 'Prompt',
      icon: <Icons.Prompt style={{ width: 14, height: 14 }} />
    }
  ];

  const SAMPLE_SNIPPETS = [
    { title: 'Tailwind Button', content: '<button className="px-4 py-2 bg-zinc-900 text-white rounded-md">Save</button>', type: 'code' },
    { title: 'Brand Violet Color', content: '#6366f1', type: 'color' },
    { title: 'GitHub PR Link', content: 'https://github.com/company/repo/pull/482', type: 'url' },
    { title: 'SQL Aggregation Query', content: 'SELECT category, COUNT(*) FROM clips GROUP BY category;', type: 'code' }
  ];

  const handleSimulateCopy = (snippet) => {
    setCopiedToast(`Copied "${snippet.title}" to clipboard!`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  const filteredClips = DEMO_CLIPS.filter(c => {
    if (activeTab !== 'all' && c.type !== activeTab) return false;
    if (demoQuery.trim()) {
      return c.title.toLowerCase().includes(demoQuery.toLowerCase()) || 
             c.preview.toLowerCase().includes(demoQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="landing-container">
      {/* Animated Ambient Background */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="ambient-grid-pattern" />
        <div className="ambient-orb orb-top-center" />
        <div className="ambient-orb orb-left-glow" />
        <div className="ambient-orb orb-right-glow" />
        <div className="ambient-orb orb-bottom-glow" />
        <div className="ambient-beam" />
        {/* Floating cyber particles */}
        <div className="ambient-particle p-1" />
        <div className="ambient-particle p-2" />
        <div className="ambient-particle p-3" />
        <div className="ambient-particle p-4" />
        <div className="ambient-particle p-5" />
        <div className="ambient-particle p-6" />
      </div>

      {/* Toast Notification */}
      {copiedToast && (
        <div className="landing-toast">
          <Icons.Logo style={{ width: 16, height: 16 }} />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-logo-wrap">
            <div className="landing-logo-box">
              <Icons.Logo style={{ width: 22, height: 22, color: '#ffffff' }} />
            </div>
            <span className="landing-header-title">Copycat</span>
            <span className="landing-version-tag">v1.0 Local</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#playground">Playground</a>
            <a href="#comparison">Why Copycat</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="landing-nav-actions">
            <a
              href="/downloads/Copycat-Windows-x64.zip"
              download="Copycat-Windows-x64.zip"
              className="landing-download-nav-btn"
            >
              <Icons.Download style={{ width: 13, height: 13 }} />
              <span>Download</span>
            </a>
            <button className="landing-nav-btn" onClick={onComplete}>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="landing-hero-wrap">
        <div className="landing-hero-glow" />

        <h1 className="landing-hero-title">
          Your computer <span className="gradient-text">forgets.</span><br />
          Copycat doesn't.
        </h1>

        <p className="landing-hero-subtitle">
          An ultra-fast, local clipboard memory utility that indexes every text, code snippet, URL, and color swatch you copy. Find anything instantly with natural language search.
        </p>

        <div className="landing-hero-actions">
          <a
            href="/downloads/Copycat-Windows-x64.zip"
            download="Copycat-Windows-x64.zip"
            className="landing-cta-btn large"
          >
            <Icons.Download style={{ width: 16, height: 16, marginRight: 4 }} />
            Download for Windows
          </a>
          <button className="landing-secondary-btn large" onClick={onComplete}>
            Live Web Preview →
          </button>
        </div>

        <div className="landing-platforms-row">
          <span className="platform-tag">
            <Icons.Windows style={{ width: 12, height: 12, marginRight: 4 }} /> Windows 10 / 11
          </span>
          <span className="platform-bullet">•</span>
          <span className="platform-tag">macOS (DMG)</span>
          <span className="platform-bullet">•</span>
          <span className="platform-tag">Linux (AppImage)</span>
          <span className="platform-bullet">•</span>
          <span className="platform-tag">v1.0.0 Free</span>
        </div>

        {/* Hero Interactive App Mockup */}
        <div className="landing-hero-preview">
          <div className="preview-window">
            <div className="preview-window-top">
              <div className="preview-dots">
                <span className="dot dot-r" />
                <span className="dot dot-y" />
                <span className="dot dot-g" />
              </div>
              <div className="preview-search-bar">
                <Icons.Search style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Search anything you’ve copied (e.g. 'code', 'link', 'color', 'notes')..." 
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  className="preview-input"
                />
                {demoQuery && (
                  <button className="preview-clear-btn" onClick={() => setDemoQuery('')}>×</button>
                )}
              </div>
              <div className="preview-status-pill">
                <span className="status-live-dot" />
                <span>Monitoring Active</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="preview-tabs">
              {['all', 'code', 'color', 'url', 'prompt'].map(tab => (
                <button 
                  key={tab} 
                  className={`preview-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Simulated Live Clips List */}
            <div className="preview-clips-grid">
              {filteredClips.length > 0 ? (
                filteredClips.map((clip) => (
                  <div key={clip.id} className="preview-clip-card">
                    <div className="clip-card-header">
                      <span className="clip-type-badge">
                        {clip.icon}
                        <span>{clip.badge}</span>
                      </span>
                      <span className="clip-time">{clip.time}</span>
                    </div>
                    <div className="clip-title">{clip.title}</div>
                    <div className="clip-snippet">
                      {clip.color && (
                        <span className="color-swatch-box" style={{ background: clip.color }} />
                      )}
                      <code>{clip.preview}</code>
                    </div>
                  </div>
                ))
              ) : (
                <div className="preview-empty-state">
                  <Icons.Search style={{ width: 24, height: 24, opacity: 0.4 }} />
                  <span>No matching clips found for "{demoQuery}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Metrics & Trust Bar */}
      <section className="landing-stats-bar">
        <div className="stat-item">
          <div className="stat-number">&lt; 10ms</div>
          <div className="stat-desc">Instant search latency</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-number">100% Local</div>
          <div className="stat-desc">Pure SQLite storage</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-number">Zero Cloud</div>
          <div className="stat-desc">Private & offline-first</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-number">Alt + C</div>
          <div className="stat-desc">Global HUD access</div>
        </div>
      </section>

      {/* 3. Bento Grid Feature Showcase */}
      <section id="features" className="landing-bento-section">
        <div className="section-header">
          <span className="section-tag">Powerful Capabilities</span>
          <h2 className="section-title">Designed for developer speed</h2>
          <p className="section-subtitle">Everything you copy is neatly classified, indexed, and accessible in milliseconds.</p>
        </div>

        <div className="bento-grid">
          {/* Bento Item 1: Semantic Search */}
          <div className="bento-card bento-large">
            <div className="bento-badge">
              <Icons.Search style={{ width: 16, height: 16 }} /> Semantic Intelligence
            </div>
            <h3 className="bento-card-title">Search by concept, not exact syntax</h3>
            <p className="bento-card-desc">
              Can't remember the exact variable name? Type "that regex for validating emails" or "the gradient we used on landing" and Copycat finds it instantly.
            </p>
            <div className="bento-search-demo">
              <div className="demo-chip-list">
                <span className="demo-chip">"stripe webhook secret"</span>
                <span className="demo-chip">"css glassmorphism"</span>
                <span className="demo-chip">"docker compose postgres"</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Smart Categories */}
          <div className="bento-card">
            <div className="bento-badge">
              <Icons.Folder style={{ width: 16, height: 16 }} /> Real-time Classification
            </div>
            <h3 className="bento-card-title">Automated smart folders</h3>
            <p className="bento-card-desc">
              Real-time classification sorts links, code, colors, prompts, and emails automatically without manual filing.
            </p>
            <div className="bento-tags-preview">
              <span className="type-tag code">TypeScript</span>
              <span className="type-tag color">HEX / RGB</span>
              <span className="type-tag url">Web Links</span>
              <span className="type-tag prompt">AI Prompts</span>
            </div>
          </div>

          {/* Bento Item 3: Privacy Shield */}
          <div className="bento-card">
            <div className="bento-badge">
              <Icons.Shield style={{ width: 16, height: 16 }} /> Privacy Protection
            </div>
            <h3 className="bento-card-title">Sensitive app blacklist</h3>
            <p className="bento-card-desc">
              Automatic exclusion rules prevent capturing clips from 1Password, Bitwarden, KeePass, or private incognito windows.
            </p>
            <div className="bento-shield-indicator">
              <span className="shield-pill">
                <Icons.Shield style={{ width: 12, height: 12, marginRight: 4 }} /> Passwords Blocked
              </span>
              <span className="shield-pill">
                <Icons.Shield style={{ width: 12, height: 12, marginRight: 4 }} /> 0 Cloud Requests
              </span>
            </div>
          </div>

          {/* Bento Item 4: Instant Color Palette */}
          <div className="bento-card">
            <div className="bento-badge">
              <Icons.Color style={{ width: 16, height: 16 }} /> Color Converter
            </div>
            <h3 className="bento-card-title">One-click color formats</h3>
            <p className="bento-card-desc">
              Copy any hex code to inspect color swatches and transform between HEX, RGB, and HSL formats on the fly.
            </p>
            <div className="bento-colors-preview">
              <span className="color-dot" style={{ background: '#6366f1' }} title="#6366f1" />
              <span className="color-dot" style={{ background: '#38bdf8' }} title="#38bdf8" />
              <span className="color-dot" style={{ background: '#22c55e' }} title="#22c55e" />
              <span className="color-dot" style={{ background: '#ffd60a' }} title="#ffd60a" />
              <span className="color-dot" style={{ background: '#f43f5e' }} title="#f43f5e" />
            </div>
          </div>

          {/* Bento Item 5: Offline SQLite Vault */}
          <div className="bento-card">
            <div className="bento-badge">
              <Icons.Logo style={{ width: 16, height: 16 }} /> SQLite Vector Engine
            </div>
            <h3 className="bento-card-title">100% Local database</h3>
            <p className="bento-card-desc">
              Your history is persisted in a fast, embedded SQLite file on your drive. Zero cloud sync, zero telemetry, instant queries.
            </p>
            <div className="bento-db-indicator">
              <span className="db-pill">
                <Icons.File style={{ width: 12, height: 12, marginRight: 4 }} /> copycat.db (SQLite)
              </span>
              <span className="db-pill">
                <Icons.Clock style={{ width: 12, height: 12, marginRight: 4 }} /> 0ms Cloud Latency
              </span>
            </div>
          </div>

          {/* Bento Item 6: Keyboard HUD */}
          <div className="bento-card bento-large">
            <div className="bento-badge">
              <Icons.Star style={{ width: 16, height: 16 }} /> Keyboard-Driven HUD
            </div>
            <h3 className="bento-card-title">Raycast-inspired floating search</h3>
            <p className="bento-card-desc">
              Press Alt+C from inside any IDE, browser, or terminal to invoke the floating HUD. Navigate with arrow keys and press Enter to paste back.
            </p>
            <div className="bento-keys-preview">
              <span className="kbd-preview"><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
              <span className="kbd-preview"><kbd>↵</kbd> Paste</span>
              <span className="kbd-preview"><kbd>Tab</kbd> Cycle Types</span>
            </div>
          </div>

          {/* Bento Item 7: Image & Screenshot OCR */}
          <div className="bento-card">
            <div className="bento-badge">
              <Icons.Image style={{ width: 16, height: 16 }} /> Visual Memory & OCR
            </div>
            <h3 className="bento-card-title">Screenshot thumbnails</h3>
            <p className="bento-card-desc">
              Copy screenshots, diagrams, and mockups. Copycat generates instant thumbnails and visual previews in your feed.
            </p>
            <div className="bento-ocr-preview">
              <span className="ocr-pill">
                <Icons.Image style={{ width: 12, height: 12, marginRight: 4 }} /> PNG / JPG Preview
              </span>
              <span className="ocr-pill">
                <Icons.Code style={{ width: 12, height: 12, marginRight: 4 }} /> High-DPI Render
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Simulator Playground */}
      <section id="playground" className="landing-playground-section">
        <div className="section-header">
          <span className="section-tag">Interactive Simulation</span>
          <h2 className="section-title">Test the smart classifier</h2>
          <p className="section-subtitle">Click any sample below to simulate copying and see how Copycat tags it.</p>
        </div>

        <div className="playground-cards-grid">
          {SAMPLE_SNIPPETS.map((snippet, idx) => (
            <div 
              key={idx} 
              className="playground-card"
              onClick={() => handleSimulateCopy(snippet)}
            >
              <div className="playground-card-top">
                <span className="snippet-type-badge">{snippet.type}</span>
                <span className="copy-action-text">
                  <Icons.Copy style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 4 }} /> Click to copy
                </span>
              </div>
              <div className="playground-snippet-title">{snippet.title}</div>
              <code className="playground-code">{snippet.content}</code>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Feature Comparison Table */}
      <section id="comparison" className="landing-comparison-section">
        <div className="section-header">
          <span className="section-tag">Comparison</span>
          <h2 className="section-title">Why switch to Copycat?</h2>
          <p className="section-subtitle">See how Copycat compares to basic OS clipboard history.</p>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Default OS Clipboard</th>
                <th className="highlight-col">Copycat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Search Intelligence</td>
                <td className="dim">Exact substring only</td>
                <td className="highlight-col"><strong>Semantic concept search</strong></td>
              </tr>
              <tr>
                <td>Automatic Categorization</td>
                <td className="dim">None (flat list)</td>
                <td className="highlight-col"><strong>Real-time smart folders</strong></td>
              </tr>
              <tr>
                <td>Data Privacy & Telemetry</td>
                <td className="dim">Cloud sync enabled</td>
                <td className="highlight-col"><strong>100% Offline SQLite database</strong></td>
              </tr>
              <tr>
                <td>Password Manager Shield</td>
                <td className="dim">Captures all credentials</td>
                <td className="highlight-col"><strong>Auto-blacklists sensitive apps</strong></td>
              </tr>
              <tr>
                <td>HUD Latency</td>
                <td className="dim">~200ms - 500ms</td>
                <td className="highlight-col"><strong>&lt; 10ms instant response</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="landing-faq-section">
        <div className="section-header">
          <span className="section-tag">Questions & Answers</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion">
          {[
            {
              q: 'Where is my clipboard history stored?',
              a: 'All clips and embeddings are stored 100% locally on your machine in an offline WebAssembly SQLite database located in your AppData directory. Nothing ever leaves your computer.'
            },
            {
              q: 'How do I open the search overlay from any app?',
              a: 'Press Alt + C (or Alt + V / Ctrl + Shift + V) on your keyboard at any time. The floating search bar will appear on top of all windows.'
            },
            {
              q: 'Does Copycat save passwords or sensitive data?',
              a: 'Copycat includes an App Blacklist feature that automatically ignores clipboard contents from password managers like 1Password, Bitwarden, KeePass, and Dashlane.'
            },
            {
              q: 'Can I use Copycat in the browser or as a desktop app?',
              a: 'Both! You can use the web dashboard at localhost:5173 or run the native desktop client with global hotkeys and system tray integration.'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${activeFaq === idx ? 'open' : ''}`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-toggle-icon">{activeFaq === idx ? '−' : '+'}</span>
              </div>
              {activeFaq === idx && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Footer CTA Banner */}
      <section className="landing-footer-cta-wrap">
        <div className="footer-cta-card">
          <h2 className="footer-cta-title">Start remembering everything today</h2>
          <p className="footer-cta-desc">Free, local-first, zero telemetry, and open-source on GitHub.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/downloads/Copycat-Windows-x64.zip"
              download="Copycat-Windows-x64.zip"
              className="landing-cta-btn large"
            >
              <Icons.Download style={{ width: 16, height: 16, marginRight: 6 }} />
              Download Copycat Free
            </a>
            <a
              href="https://github.com/ChrisD1231/CopyCat"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-secondary-btn large"
            >
              <Icons.Github style={{ width: 16, height: 16, marginRight: 6 }} />
              GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <Icons.Logo style={{ width: 18, height: 18, color: '#ffffff' }} />
            <span>Copycat</span>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#playground">Playground</a>
            <a href="#comparison">Why Copycat</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="footer-copy">
            Private by Default · 100% Local-First
          </div>
        </div>
      </footer>
    </div>
  );
}
