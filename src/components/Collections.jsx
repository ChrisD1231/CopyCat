import { useState, useEffect } from 'react';
import ClipboardItem from './ClipboardItem.jsx';

const api = window.copycat;

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);
    try {
      if (!api) {
        setCollections(mockCollections);
        return;
      }
      const data = await api.getCollections();
      setCollections(data || []);
    } catch {
      setCollections(mockCollections);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCollection(col) {
    setSelected(col);
    setSelectedItems(col.items || []);
  }

  async function handleCopy(item) {
    if (api) await api.copyItem(item.id);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (selected) {
    return (
      <>
        <div className="content-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button
                onClick={() => setSelected(null)}
                style={{ color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer' }}
              >
                ← Collections
              </button>
            </div>
            <h1 className="content-title">
              {selected.icon} {selected.name}
            </h1>
            <div className="content-subtitle">{selected.count || selected.items?.length || 0} memories</div>
          </div>
          {selected.is_auto && (
            <div style={{
              fontSize: 11,
              color: 'var(--accent-mint)',
              background: 'var(--accent-mint-dim)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(103,199,181,0.2)',
            }}>
              ✦ Auto-generated
            </div>
          )}
        </div>
        <div className="content-scroll">
          {selectedItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{selected.icon}</div>
              <div className="empty-title">Collection is empty</div>
            </div>
          ) : (
            <div className="items-list">
              {selectedItems.map(item => (
                <ClipboardItem
                  key={item.id}
                  item={item}
                  onCopy={() => handleCopy(item)}
                  onFavorite={() => {}}
                  onDelete={() => {}}
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

  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Collections</h1>
          <div className="content-subtitle">
            Automatically organized clipboard memories
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>
          + New Collection
        </button>
      </div>

      <div className="content-scroll">
        {loading ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-tertiary)' }}>Loading...</div>
          </div>
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂</div>
            <div className="empty-title">No collections yet</div>
            <div className="empty-desc">
              Copycat automatically groups related clipboard items. Copy a few things and check back!
            </div>
          </div>
        ) : (
          <>
            {/* Auto collections */}
            {collections.some(c => c.is_auto) && (
              <div style={{ padding: '16px 20px 0' }}>
                <div className="nav-section-label" style={{ padding: 0, marginBottom: 12 }}>
                  ✦ Auto-generated
                </div>
                <div className="collections-grid" style={{ padding: 0 }}>
                  {collections.filter(c => c.is_auto).map(col => (
                    <CollectionCard key={col.id} col={col} onClick={() => handleSelectCollection(col)} />
                  ))}
                </div>
              </div>
            )}
            {/* Manual collections */}
            {collections.some(c => !c.is_auto) && (
              <div style={{ padding: '16px 20px 0' }}>
                <div className="nav-section-label" style={{ padding: 0, marginBottom: 12 }}>
                  My Collections
                </div>
                <div className="collections-grid" style={{ padding: 0 }}>
                  {collections.filter(c => !c.is_auto).map(col => (
                    <CollectionCard key={col.id} col={col} onClick={() => handleSelectCollection(col)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function CollectionCard({ col, onClick }) {
  return (
    <div className="collection-card" onClick={onClick} id={`collection-${col.id}`}>
      <div className="collection-accent-bar" style={{ background: col.color || 'var(--accent-indigo)' }} />
      <div className="collection-icon">{col.icon}</div>
      <div className="collection-name">{col.name}</div>
      <div className="collection-count">{col.count || col.items?.length || 0} memories</div>
      <div className="collection-description">{col.description}</div>
      {col.items && col.items.length > 0 && (
        <div className="collection-preview">
          {col.items.slice(0, 4).map(item => (
            <span key={item.id} className="preview-chip">
              {getTypeIcon(item.content_type)} {(item.title || item.content || '').substring(0, 20)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getTypeIcon(type) {
  const icons = { code: '💻', url: '🔗', color: '🎨', email: '✉️', phone: '📱', prompt: '🤖', text: '📝', image: '🖼️' };
  return icons[type] || '📝';
}

const mockCollections = [
  {
    id: 'c1', name: 'Lighthouse Construction', icon: '🏗️', color: '#F59E0B', is_auto: true,
    description: 'All memories from the Lighthouse Construction project', count: 14,
    items: [{ id: 'i1', content_type: 'email', title: 'mike.thompson@lighthouse.com', content: 'mike.thompson@lighthouseconstruction.com', created_at: Date.now() - 1000*60*60*24*12 }]
  },
  {
    id: 'c2', name: 'Boat Website', icon: '⛵', color: '#67C7B5', is_auto: true,
    description: 'Wake boat brand website — design and code', count: 18,
    items: [{ id: 'i2', content_type: 'code', title: 'GSAP ScrollTrigger', content: 'gsap.registerPlugin(ScrollTrigger)', created_at: Date.now() - 1000*60*60*24*21 }]
  },
  {
    id: 'c3', name: 'Animation & Scroll', icon: '✨', color: '#6366F1', is_auto: true,
    description: 'Scroll animation libraries, GSAP code, and motion design resources', count: 8,
    items: []
  },
  {
    id: 'c4', name: 'AI Prompts', icon: '🤖', color: '#0EA5E9', is_auto: true,
    description: 'Saved prompts for AI tools', count: 5,
    items: []
  },
];
