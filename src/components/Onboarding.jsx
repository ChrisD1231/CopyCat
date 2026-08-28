import { useState } from 'react';
import { Icons } from './Icons.jsx';

const STEPS = [
  {
    id: 'welcome',
    eyebrow: 'Welcome to Copycat',
    title: <>Your computer <em>forgets.</em><br />Copycat doesn't.</>,
    subtitle: 'Every URL, code snippet, color, and note you copy is remembered forever — and instantly searchable.',
    cta: 'Get started',
    content: 'logo',
  },
  {
    id: 'capture',
    eyebrow: 'Everything becomes searchable',
    title: <>Everything you copy<br />becomes <em>findable.</em></>,
    subtitle: 'Copycat automatically recognizes what you copy and understands it — so you can find it later, even with different words.',
    cta: 'Continue',
    content: 'flyingItems',
  },
  {
    id: 'search',
    eyebrow: 'Semantic search',
    title: <>Words you don't<br />remember? <em>No problem.</em></>,
    subtitle: 'Search naturally. Copycat understands what you mean, not just what you type.',
    cta: 'Continue',
    content: 'searchDemo',
  },
  {
    id: 'shortcut',
    eyebrow: 'Your global shortcut',
    title: <>Meet your new<br /><em>shortcut.</em></>,
    subtitle: 'Open Copycat from anywhere on your computer — instantly.',
    cta: 'Continue',
    content: 'shortcut',
  },
  {
    id: 'ready',
    eyebrow: "You're all set",
    title: <>Copycat is <em>ready.</em></>,
    subtitle: 'Start copying things. Your clipboard history is being built right now.',
    cta: 'Start remembering',
    content: 'ready',
  },
];

const FLYING_ITEMS = [
  { icon: <Icons.Link style={{ width: 13, height: 13 }} />, label: 'URL' },
  { icon: <Icons.Code style={{ width: 13, height: 13 }} />, label: 'Code' },
  { icon: <Icons.Color style={{ width: 13, height: 13 }} />, label: 'Color' },
  { icon: <Icons.Text style={{ width: 13, height: 13 }} />, label: 'Text' },
  { icon: <Icons.Prompt style={{ width: 13, height: 13 }} />, label: 'Prompt' },
  { icon: <Icons.Email style={{ width: 13, height: 13 }} />, label: 'Email' },
  { icon: <Icons.Image style={{ width: 13, height: 13 }} />, label: 'Image' },
  { icon: <Icons.Phone style={{ width: 13, height: 13 }} />, label: 'Phone' },
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
            <div className="onboarding-logo">
              <Icons.Logo style={{ width: 28, height: 28, color: 'white' }} />
            </div>
          )}

          {current.content === 'flyingItems' && (
            <div className="flying-items" style={{ maxWidth: 380 }}>
              {FLYING_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="flying-item"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <span style={{ display: 'inline-flex', marginRight: 4 }}>{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          )}

          {current.content === 'searchDemo' && (
            <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
              {/* Copied item */}
              <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                marginBottom: 16,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Copied 47 days ago
                </div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--type-code)' }}>
                  gsap.registerPlugin(ScrollTrigger);
                </code>
              </div>

              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>Today you search...</div>

              {/* Search bar */}
              <div style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
                boxShadow: '0 0 14px rgba(99, 102, 241, 0.08)'
              }}>
                <Icons.Search style={{ width: 14, height: 14, color: 'var(--text-tertiary)' }} />
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
                  that scrolling animation code
                </span>
              </div>

              {/* Result */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <Icons.Code style={{ width: 14, height: 14, color: 'var(--type-code)' }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>GSAP ScrollTrigger Animation</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>JavaScript · gsap.com · 47 days ago</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>Found.</span>
              </div>
            </div>
          )}

          {current.content === 'shortcut' && (
            <div style={{ marginTop: 8 }}>
              <div className="shortcut-display">
                {['Ctrl', 'Shift', 'V'].map((k, i) => (
                  <span key={k} className="shortcut-key" style={{ animationDelay: `${i * 0.1}s` }}>
                    {k}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>
                Global hotkey to pop open the search overlay
              </div>
            </div>
          )}

          {current.content === 'ready' && (
            <div className="onboarding-logo" style={{ animationDuration: '2s' }}>
              <Icons.Logo style={{ width: 28, height: 28, color: 'white' }} />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="onboarding-eyebrow">{current.eyebrow}</div>
        <h1 className="onboarding-title">{current.title}</h1>
        <p className="onboarding-subtitle">{current.subtitle}</p>

        {/* CTA */}
        <button className="onboarding-cta" onClick={next}>
          {current.cta} <Icons.ArrowRight style={{ width: 13, height: 13, display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }} />
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
