import React from 'react';
import { Icons } from './Icons.jsx';

export default function Onboarding({ onComplete }) {
  return (
    <div className="landing-container">
      {/* Top Navbar */}
      <header className="landing-header">
        <div className="landing-logo-wrap">
          <Icons.Logo className="landing-header-logo" />
          <span className="landing-header-title">Copycat</span>
        </div>
        <button className="landing-nav-btn" onClick={onComplete}>
          Open Dashboard
        </button>
      </header>

      {/* 1. Hero Section */}
      <section className="landing-section hero-section">
        <div className="landing-hero-logo">
          <Icons.Logo />
        </div>
        <h1 className="landing-hero-title">
          Your computer <em>forgets.</em><br />
          Copycat doesn't.
        </h1>
        <p className="landing-hero-subtitle">
          An AI-powered clipboard memory utility that stores every text, code snippet, URL, and color swatch you copy. Find anything later using natural language.
        </p>

        <div className="landing-hero-actions">
          <button className="landing-cta-btn" onClick={onComplete}>
            Start Remembering <Icons.ArrowRight style={{ width: 14, height: 14, marginLeft: 4 }} />
          </button>
        </div>

        <div className="shortcut-hint-wrap">
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Global hotkey</span>
          <div className="shortcut-display">
            {['Ctrl', 'Shift', 'V'].map(k => (
              <span key={k} className="shortcut-key">{k}</span>
            ))}
          </div>
        </div>
        
        <div className="scroll-indicator">
          <span style={{ color: 'var(--text-tertiary)' }}>Scroll down to see how it works</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* 2. Semantic Search Feature Section */}
      <section className="landing-section feature-section">
        <div className="feature-info">
          <div className="landing-eyebrow">Search by meaning</div>
          <h2 className="feature-title">Copy once. Find forever.</h2>
          <p className="feature-description">
            Normal clipboard histories require you to remember the exact wording. Copycat indexes your clips using semantic vectors, meaning you can search by concept or context.
          </p>
        </div>

        {/* Search Mockup (Raycast style search view) */}
        <div className="landing-demo-card search-demo-card">
          <div className="demo-window-header">
            <div className="demo-window-dots">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
            </div>
            <span className="demo-window-title">Copycat Search</span>
          </div>

          <div className="demo-search-input-wrap">
            <Icons.Search style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span className="demo-search-text">that smooth scrolling animation code</span>
            <span className="kbd" style={{ fontSize: 9, marginLeft: 'auto' }}>esc</span>
          </div>

          <div className="demo-results">
            <div className="demo-result active">
              <Icons.Code style={{ width: 14, height: 14, color: 'var(--type-code)' }} />
              <div className="demo-result-text">
                <span className="demo-result-title">GSAP ScrollTrigger Animation Script</span>
                <span className="demo-result-meta">JavaScript · gsap.com · 47 days ago</span>
              </div>
              <span className="demo-found-tag">Found</span>
            </div>

            <div className="demo-code-block">
              {`gsap.registerPlugin(ScrollTrigger);
gsap.to(".logo", {
  scrollTrigger: ".trigger", // start animation on trigger
  x: 500
});`}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Auto Collections Feature Section */}
      <section className="landing-section feature-section alt-layout">
        <div className="feature-info">
          <div className="landing-eyebrow">Smart categorization</div>
          <h2 className="feature-title">Automatically organized.</h2>
          <p className="feature-description">
            Your copied data is classified in real-time. Copycat groups related items into smart folders (Code, Links, Color Swatches, Prompts) without any manual drag-and-drop.
          </p>
        </div>

        {/* Collections Mockup Grid */}
        <div className="landing-demo-card collections-demo-card">
          <div className="demo-collections-grid">
            <div className="demo-col-card">
              <Icons.Folder style={{ width: 22, height: 22, color: '#6366f1' }} />
              <div className="demo-col-name">Code Snippets</div>
              <div className="demo-col-count">24 items</div>
            </div>

            <div className="demo-col-card">
              <Icons.Folder style={{ width: 22, height: 22, color: '#67C7B5' }} />
              <div className="demo-col-name">Design & Colors</div>
              <div className="demo-col-count">18 items</div>
            </div>

            <div className="demo-col-card">
              <Icons.Folder style={{ width: 22, height: 22, color: '#ffd60a' }} />
              <div className="demo-col-name">Documentation Links</div>
              <div className="demo-col-count">31 items</div>
            </div>

            <div className="demo-col-card">
              <Icons.Folder style={{ width: 22, height: 22, color: '#bf5af2' }} />
              <div className="demo-col-name">AI Prompts</div>
              <div className="demo-col-count">12 items</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer CTA Section */}
      <section className="landing-section cta-section">
        <h2 className="cta-title">Upgrade your memory today.</h2>
        <p className="cta-subtitle">
          Copycat runs locally, keeping your database completely secure and private on your machine.
        </p>
        <button className="landing-cta-btn large" onClick={onComplete}>
          Open Copycat Dashboard
        </button>
        <div className="landing-footer-credits">
          Private by Default · Pure WebAssembly SQLite · 100% Local-First
        </div>
      </section>
    </div>
  );
}
