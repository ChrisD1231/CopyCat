import { useState, useEffect, useRef, useCallback } from 'react';
import { getTypeMeta, formatDate } from '../ClipboardItem.jsx';
import { Icons } from '../Icons.jsx';


const api = window.copycat;

export default function FloatingSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent on mount
  useEffect(() => {
    loadRecent();
    if (api) {
      api.getSettings().then(s => {
        if (s && s.theme) document.documentElement.setAttribute('data-theme', s.theme);
      });
    }
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (!api) return;
    const unsub = api.onOverlayFocus(() => {
      setQuery('');
      setFocusedIndex(0);
      loadRecent();
      api.getSettings().then(s => {
        if (s && s.theme) document.documentElement.setAttribute('data-theme', s.theme);
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    });

    const unsubClose = api.onOverlayClose(() => {
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 200);
    });

    // Focus on mount
    setTimeout(() => inputRef.current?.focus(), 100);

    return () => { unsub?.(); unsubClose?.(); };
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        loadRecent();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadRecent() {
    try {
      if (!api) {
        setResults(mockResults);
        return;
      }
      const data = await api.getRecent(15);
      setResults(data || []);
      setFocusedIndex(0);
    } catch {
      setResults(mockResults);
    }
  }

  async function performSearch(q) {
    try {
      if (!api) {
        setResults(mockResults.filter(r =>
          (r.title || r.content || '').toLowerCase().includes(q.toLowerCase())
        ));
        return;
      }
      const data = await api.search(q);
      setResults(data || []);
      setFocusedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (api) api.hideOverlay();
    }, 150);
  }, []);

  const handleCopy = useCallback(async (item) => {
    if (api) {
      await api.copyItem(item.id);
    }
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
      handleClose();
    }, 400);
  }, [handleClose]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(i => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[focusedIndex]) {
            handleCopy(results[focusedIndex]);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setFocusedIndex(i => Math.max(i - 1, 0));
          } else {
            setFocusedIndex(i => Math.min(i + 1, results.length - 1));
          }
          break;
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [results, focusedIndex, handleClose, handleCopy]);

  // Scroll focused item into view
  useEffect(() => {
    const el = listRef.current?.children[focusedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  return (
    <div className="overlay-container" onClick={handleClose}>
      <div
        className={`overlay-card ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header / Search */}
        <div className="overlay-header">
          <div className="overlay-back-icon">
            <Icons.ArrowLeft style={{ width: 15, height: 15 }} />
          </div>
          <input
            ref={inputRef}
            id="overlay-search-input"
            type="text"
            className="overlay-search"
            placeholder="Search memories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Results */}
        <div className="overlay-results" ref={listRef}>
          {results.length === 0 && query ? (
            <div className="no-results">
              <div className="no-results-icon"><Icons.Search style={{ width: 24, height: 24, opacity: 0.3 }} /></div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                No results for "{query}"
              </div>
            </div>
          ) : (
            results.map((item, i) => (
              <OverlayResult
                key={item.id}
                item={item}
                isFocused={i === focusedIndex}
                isCopied={copiedId === item.id}
                onClick={() => handleCopy(item)}
                onHover={() => setFocusedIndex(i)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="overlay-footer">
          <div className="overlay-footer-left">
            <Icons.Logo style={{ width: 13, height: 13, color: 'var(--text-secondary)' }} />
            <span className="overlay-footer-tag">Search memories</span>
          </div>
          
          <div className="overlay-footer-right">
            <span className="overlay-hint">
              Copy <span className="kbd">↵</span>
            </span>
            <span className="overlay-hint-separator">|</span>
            <span className="overlay-hint">
              Actions <span className="kbd">⌘</span> <span className="kbd">K</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverlayResult({ item, isFocused, isCopied, onClick, onHover }) {
  const meta = getTypeMeta(item.content_type);

  return (
    <div
      className={`overlay-result ${isFocused ? 'focused' : ''}`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {/* Icon / Swatch */}
      <div className="overlay-result-icon">
        {item.content_type === 'color' && item.color_hex ? (
          <div
            className="overlay-color-swatch"
            style={{ background: item.color_hex, display: 'inline-block' }}
          />
        ) : item.content_type === 'url' && item.favicon_url ? (
          <img
            src={item.favicon_url}
            alt=""
            style={{ width: 16, height: 16, borderRadius: 3, verticalAlign: 'middle' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          meta.icon
        )}
      </div>

      {/* Body */}
      <div className="overlay-result-body">
        <div className="overlay-result-title">
          {isCopied ? '✓ Copied!' : (item.title || item.content?.substring(0, 60))}
        </div>
        <div className="overlay-result-meta">
          <span className="overlay-result-type" style={{ color: meta.color }}>
            {meta.label}
          </span>
          {item.source_domain && (
            <>
              <span style={{ color: 'var(--text-disabled)' }}>·</span>
              <span className="overlay-result-date">{item.source_domain}</span>
            </>
          )}
          <span style={{ color: 'var(--text-disabled)' }}>·</span>
          <span className="overlay-result-date">{formatDate(item.created_at)}</span>
        </div>
        {item.description && !isCopied && (
          <div className="overlay-result-desc">{item.description}</div>
        )}
      </div>

      {/* Copy badge when focused */}
      {isFocused && !isCopied && (
        <div style={{
          fontSize: 10,
          color: 'var(--text-tertiary)',
          background: 'var(--bg-4)',
          border: '1px solid var(--border-default)',
          borderRadius: 4,
          padding: '2px 6px',
          flexShrink: 0,
        }}>
          ↵ copy
        </div>
      )}
    </div>
  );
}

// Fallback mock results for development without Electron
const mockResults = [
  {
    id: 'mock-1',
    content: 'gsap.registerPlugin(ScrollTrigger);',
    content_type: 'code',
    title: 'GSAP ScrollTrigger Animation',
    description: 'GSAP ScrollTrigger code — scroll-based website animation',
    tags: ['javascript', 'gsap', 'animation'],
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 21,
    is_favorite: false,
    use_count: 2,
    source_domain: 'gsap.com',
  },
  {
    id: 'mock-2',
    content: 'https://ui.aceternity.com/components',
    content_type: 'url',
    title: 'Aceternity UI',
    description: 'Animated React UI component library',
    tags: ['design', 'react', 'components'],
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 31,
    is_favorite: false,
    use_count: 1,
    source_domain: 'ui.aceternity.com',
    favicon_url: 'https://www.google.com/s2/favicons?domain=ui.aceternity.com&sz=32',
  },
  {
    id: 'mock-3',
    content: '#67C7B5',
    content_type: 'color',
    title: 'Seafoam — #67C7B5',
    description: 'Seafoam green color from Figma',
    tags: ['color', 'seafoam', 'green'],
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 58,
    is_favorite: true,
    use_count: 5,
    color_hex: '#67C7B5',
    color_name: 'Seafoam',
  },
  {
    id: 'mock-4',
    content: 'Modern green wake boat traveling across a lake',
    content_type: 'image',
    title: 'Wake Boat Image',
    description: 'Green wake boat at golden hour — low angle lake shot',
    tags: ['image', 'boat', 'marine'],
    created_at: Date.now() - 1000 * 60 * 60 * 24 * 60,
    is_favorite: false,
    use_count: 1,
  },
];
