import { useState, useEffect } from 'react';
import ClipboardItem from './ClipboardItem.jsx';

const api = window.copycat;

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      if (!api) { setItems([]); return; }
      const data = await api.getFavorites();
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(item) {
    if (api) await api.copyItem(item.id);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleFavorite(item) {
    if (api) await api.toggleFavorite(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Favorites</h1>
          <div className="content-subtitle">{items.length} starred memories</div>
        </div>
      </div>
      <div className="content-scroll">
        {loading ? (
          <div className="empty-state"><div style={{ color: 'var(--text-tertiary)' }}>Loading...</div></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <div className="empty-title">No favorites yet</div>
            <div className="empty-desc">Star important clipboard memories to find them here quickly.</div>
          </div>
        ) : (
          <div className="items-list">
            {items.map(item => (
              <ClipboardItem
                key={item.id}
                item={item}
                onCopy={() => handleCopy(item)}
                onFavorite={() => handleFavorite(item)}
                onDelete={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                isCopied={copiedId === item.id}
              />
            ))}
          </div>
        )}
      </div>
      {copiedId && (
        <div className="copied-flash">
          <span className="toast-dot" />
          Copied to clipboard!
        </div>
      )}
    </>
  );
}
