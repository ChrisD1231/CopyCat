import { useState } from 'react';

const STEPS = [
  {
    id: 'welcome',
    eyebrow: 'Welcome to Copycat',
    title: <>Your computer <em>forgets.</em><br />Copycat doesn't.</>,
    subtitle: 'Every URL, code snippet, color, and note you copy is remembered forever — and instantly searchable.',
    cta: 'Get started →',
    content: 'logo',
  },
  {
    id: 'capture',
    eyebrow: 'Everything becomes searchable',
    title: <>Everything you copy<br />becomes <em>findable.</em></>,
    subtitle: 'Copycat automatically recognizes what you copy and understands it — so you can find it later, even with different words.',
    cta: 'Continue →',
    content: 'flyingItems',
  },
  {
    id: 'search',
    eyebrow: 'Semantic search',
    title: <>Words you don't<br />remember? <em>No problem.</em></>,
    subtitle: 'Search naturally. Copycat understands what you mean, not just what you type.',
    cta: 'Continue →',
    content: 'searchDemo',
  },
  {
    id: 'shortcut',
    eyebrow: 'Your global shortcut',
    title: <>Meet your new<br /><em>shortcut.</em></>,
    subtitle: 'Open Copycat from anywhere on your computer — instantly.',
    cta: 'Continue →',
    content: 'shortcut',
  },
  {
    id: 'ready',
    eyebrow: "You're all set",
    title: <>Copycat is <em>ready.</em></>,
    subtitle: 'Start copying things. Your clipboard history is being built right now.',
    cta: 'Start remembering →',
    content: 'ready',
  },
];

const FLYING_ITEMS = [
  { icon: '🔗', label: 'URL' },
  { icon: '💻', label: 'Code' },
  { icon: '🎨', label: 'Color' },
  { icon: '📝', label: 'Text' },
  { icon: '🤖', label: 'Prompt' },
  { icon: '✉️', label: 'Email' },
  { icon: '🖼️', label: 'Image' },
  { icon: '📱', label: 'Phone' },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      onComplete();
      return;
    }
    setLeaving(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setLeaving(false);
    }, 200);
  }

  return (
    <div className="onboarding">
      <div
        className="onboarding-card onboarding-step"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Content area */}
        <div style={{ marginBottom: 32, minHeight: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {current.content === 'logo' && (
            <div className="onboarding-logo">🐱</div>
          )}

          {current.content === 'flyingItems' && (
            <div className="flying-items" style={{ maxWidth: 380 }}>
              {FLYING_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="flying-item"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}

          {current.content === 'searchDemo' && (
            <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
              {/* Copied item */}
              <div style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                marginBottom: 16,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Copied 47 days ago
                </div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--type-code)' }}>
                  gsap.registerPlugin(ScrollTrigger);
                </code>
              </div>

              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>Today you search...</div>

              {/* Search bar */}
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 14 }}>🐱</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-primary)' }}>
                  that scrolling animation code
                </span>
              </div>

              {/* Result */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span>💻</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>GSAP ScrollTrigger Animation</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>JavaScript · gsap.com · 47 days ago</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>Found.</span>
              </div>
            </div>
          )}

          {current.content === 'shortcut' && (
            <div style={{ marginTop: 8 }}>
              <div className="shortcut-display">
                {['⌘', '⇧', 'V'].map((k, i) => (
                  <span key={k} className="shortcut-key" style={{ animationDelay: `${i * 0.1}s` }}>
                    {k}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>
                Works on Windows as <strong>Ctrl + Shift + V</strong>
              </div>
            </div>
          )}

          {current.content === 'ready' && (
            <div className="onboarding-logo" style={{ animationDuration: '2s' }}>🐱</div>
          )}
        </div>

        {/* Text */}
        <div className="onboarding-eyebrow">{current.eyebrow}</div>
        <h1 className="onboarding-title">{current.title}</h1>
        <p className="onboarding-subtitle">{current.subtitle}</p>

        {/* CTA */}
        <button className="onboarding-cta" onClick={next}>
          {current.cta}
        </button>

        {/* Progress dots */}
        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
