import { useState, useEffect } from 'react';
import ClipboardItem from './ClipboardItem.jsx';
import { mockCollections } from '../mockData';
import { Icons } from './Icons.jsx';



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
            <h1 className="content-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icons.Folder style={{ width: 16, height: 16, color: selected.color }} /> {selected.name}
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
            <div className="empty-icon"><Icons.Folder style={{ width: 40, height: 40, color: 'var(--text-tertiary)' }} /></div>
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
      <div className="collection-accent-bar" style={{ background: col.color || 'var(--accent)' }} />
      <div className="collection-icon"><Icons.Folder style={{ width: 18, height: 18, color: col.color }} /></div>
      <div className="collection-name">{col.name}</div>
      <div className="collection-count">{col.count || col.items?.length || 0} memories</div>
      <div className="collection-description">{col.description}</div>
      {col.items && col.items.length > 0 && (
        <div className="collection-preview">
          {col.items.slice(0, 4).map(item => (
            <span key={item.id} className="preview-chip">
              {getTypeText(item.content_type)}: {(item.title || item.content || '').substring(0, 20)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getTypeText(type) {
  const labels = { code: 'Code', url: 'Link', color: 'Color', email: 'Email', phone: 'Phone', prompt: 'Prompt', text: 'Text', image: 'Image' };
  return labels[type] || 'Text';
}

