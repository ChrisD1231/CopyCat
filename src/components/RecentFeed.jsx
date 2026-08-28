import { useState, useEffect, useRef } from 'react';
import ClipboardItem from './ClipboardItem.jsx';
import { Icons } from './Icons.jsx';

const api = window.copycat;


const FILTERS = [
  { id: 'all',     label: 'All',      icon: <Icons.Logo style={{ width: 12, height: 12 }} /> },
  { id: 'text',    label: 'Text',     icon: <Icons.Text style={{ width: 12, height: 12 }} /> },
  { id: 'url',     label: 'Links',    icon: <Icons.Link style={{ width: 12, height: 12 }} /> },
  { id: 'code',    label: 'Code',     icon: <Icons.Code style={{ width: 12, height: 12 }} /> },
  { id: 'image',   label: 'Images',   icon: <Icons.Image style={{ width: 12, height: 12 }} /> },
  { id: 'color',   label: 'Colors',   icon: <Icons.Color style={{ width: 12, height: 12 }} /> },
  { id: 'email',   label: 'Email',    icon: <Icons.Email style={{ width: 12, height: 12 }} /> },
  { id: 'phone',   label: 'Phone',    icon: <Icons.Phone style={{ width: 12, height: 12 }} /> },
  { id: 'prompt',  label: 'Prompts',  icon: <Icons.Prompt style={{ width: 12, height: 12 }} /> },
];

export default function RecentFeed() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, [filter]);

  useEffect(() => {
    if (!api) return;
    const unsub = api.onNewItem((item) => {
      if (filter === 'all' || item.content_type === filter) {
        setItems(prev => [item, ...prev]);
      }
    });
    return unsub;
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        loadItems();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadItems() {
    setLoading(true);
    try {
      if (!api) {
        // Demo mode fallback
        setItems(getDemoItems(filter));
        return;
      }
      const data = filter === 'all'
        ? await api.getRecent(100)
        : await api.getByType(filter, 100);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load items:', err);
      setItems(getDemoItems(filter));
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(q) {
    setLoading(true);
    try {
      if (!api) {
        const filtered = mockItems.filter(item => {
          const text = (item.content + ' ' + item.title + ' ' + item.description + ' ' + (item.tags || []).join(' ')).toLowerCase();
          return text.includes(q.toLowerCase());
        });
        setItems(filtered);
        return;
      }
      const results = await api.search(q);
      setItems(results || []);
    } finally {
      setLoading(false);
    }
  }


  async function handleCopy(item) {
    if (api) {
      await api.copyItem(item.id);
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function handleFavorite(item) {
    if (!api) return;
    await api.toggleFavorite(item.id);
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i
    ));
  }

  async function handleDelete(item) {
    if (api) await api.deleteItem(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  }

  const groupedItems = groupByDate(items);

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Recent</h1>
          <div className="content-subtitle">{items.length} memories captured</div>
        </div>
        <div className="header-actions">
          <div className="status-indicator">
            <div className="status-dot" />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Live</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-input-wrap">
          <span className="search-icon"><Icons.Search style={{ width: 14, height: 14 }} /></span>
          <input
            ref={searchRef}
            id="recent-search"
            type="text"
            className="search-input"
            placeholder="Search your clipboard history..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {!searchQuery && (
            <span className="kbd" style={{ fontSize: 9 }}>Ctrl+F</span>
          )}
          {searchQuery && (
            <button
              style={{ color: 'var(--text-tertiary)', fontSize: 12, padding: '2px 6px', cursor: 'pointer' }}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="content-scroll">
        {loading ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icons.Logo style={{ width: 40, height: 40, color: 'var(--text-tertiary)' }} /></div>
            <div className="empty-title">
              {searchQuery ? 'No results found' : 'Nothing copied yet'}
            </div>
            <div className="empty-desc">
              {searchQuery 
                ? `Try different search terms — Copycat uses semantic search so you don't need exact words.`
                : 'Start copying things and they\'ll appear here automatically.'
              }
            </div>
          </div>
        ) : (
          <div>
            {searchQuery ? (
              <div className="items-list">
                {items.map(item => (
                  <ClipboardItem
                    key={item.id}
                    item={item}
                    onCopy={() => handleCopy(item)}
                    onFavorite={() => handleFavorite(item)}
                    onDelete={() => handleDelete(item)}
                    isCopied={copiedId === item.id}
                  />
                ))}
              </div>
            ) : (
              Object.entries(groupedItems).map(([group, groupItems]) => (
                <div key={group}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    padding: '12px 20px 6px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {group}
                  </div>
                  <div className="items-list">
                    {groupItems.map(item => (
                      <ClipboardItem
                        key={item.id}
                        item={item}
                        onCopy={() => handleCopy(item)}
                        onFavorite={() => handleFavorite(item)}
                        onDelete={() => handleDelete(item)}
                        isCopied={copiedId === item.id}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Copy flash */}
      {copiedId && (
        <div className="copied-flash">
          <span className="toast-dot" />
          Copied to clipboard!
        </div>
      )}
    </>
  );
}

function groupByDate(items) {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const thisWeek = today - 7 * 86400000;
  const thisMonth = today - 30 * 86400000;

  for (const item of items) {
    const ts = item.created_at;
    let label;
    if (ts >= today) label = 'Today';
    else if (ts >= yesterday) label = 'Yesterday';
    else if (ts >= thisWeek) label = 'This week';
    else if (ts >= thisMonth) label = 'This month';
    else label = 'Older';

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return groups;
}

import { mockItems } from '../mockData';

function getDemoItems(filter) {
  if (filter === 'all') return mockItems;
  return mockItems.filter(i => i.content_type === filter);
}

