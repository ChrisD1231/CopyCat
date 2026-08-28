import { useState, useEffect, useRef } from 'react';
import ClipboardItem from './ClipboardItem.jsx';
import { mockItems } from '../mockData';
import { Icons } from './Icons.jsx';



const api = window.copycat;

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    load('');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 200);
    return () => clearTimeout(t);
  }, [query]);


  async function load(q) {
    setLoading(true);
    try {
      if (!api) {
        if (!q.trim()) {
          setResults(mockItems.slice(0, 30));
          return;
        }
        const filtered = mockItems.filter(item => {
          const text = (item.content + ' ' + item.title + ' ' + item.description + ' ' + (item.tags || []).join(' ')).toLowerCase();
          return text.includes(q.toLowerCase());
        });
        setResults(filtered);
        return;
      }
      const data = q.trim() ? await api.search(q) : await api.getRecent(30);
      setResults(data || []);
    } finally {
      setLoading(false);
    }
  }


  async function handleCopy(item) {
    if (api) await api.copyItem(item.id);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Search</h1>
          <div className="content-subtitle">Find anything you've copied with natural language</div>
        </div>
      </div>
      <div className="search-container">
        <div className="search-input-wrap">
          <span className="search-icon"><Icons.Search style={{ width: 14, height: 14 }} /></span>
          <input
            ref={inputRef}
            id="main-search-input"
            type="text"
            className="search-input"
            placeholder='Try "boat animation", "green color", "scrolling code"...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }} onClick={() => setQuery('')}>✕</button>
          )}
        </div>
        {!query && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['scrolling code', 'color palette', 'react component', 'sql query', 'terminal script'].map(s => (
              <button key={s} className="filter-chip" onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="content-scroll">
        {query && !loading && (
          <div style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text-tertiary)' }}>
            {results.length} results for "{query}"
          </div>
        )}
        {results.length === 0 && !loading && query ? (
          <div className="empty-state">
            <div className="empty-icon"><Icons.Search style={{ width: 32, height: 32, opacity: 0.3 }} /></div>
            <div className="empty-title">No results</div>
            <div className="empty-desc">Try different words — semantic search finds related content even without exact matches.</div>
          </div>
        ) : (
          <div className="items-list">
            {results.map(item => (
              <ClipboardItem
                key={item.id}
                item={item}
                onCopy={() => handleCopy(item)}
                onFavorite={() => {}}
                onDelete={() => setResults(prev => prev.filter(i => i.id !== item.id))}
                isCopied={copiedId === item.id}
              />
            ))}
          </div>
        )}
      </div>
      {copiedId && (
        <div className="copied-flash"><span className="toast-dot" />Copied to clipboard!</div>
      )}
    </>
  );
}
