import { useState, useEffect } from 'react';
import ClipboardItem from './ClipboardItem.jsx';
import { mockCollections } from '../mockData';
import { Icons } from './Icons.jsx';

const api = window.copycat;

const PALETTES = [
  '#6366f1', // Indigo
  '#38bdf8', // Sky
  '#22c55e', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#ef4444', // Red
  '#71717a', // Zinc
];

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'auto', 'custom'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');
  const [collectionQuery, setCollectionQuery] = useState('');
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
      setCollections(data && data.length > 0 ? data : mockCollections);
    } catch {
      setCollections(mockCollections);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectCollection(col) {
    setSelected(col);
    setCollectionQuery('');
    if (api && col.is_auto) {
      try {
        const typeMap = {
          'Code Snippets': 'code',
          'Web Links': 'url',
          'Color Palette': 'color',
          'AI Prompts': 'prompt'
        };
        const type = typeMap[col.name];
        if (type) {
          const items = await api.getByType(type, 50);
          setSelectedItems(items || []);
          return;
        }
      } catch (e) {}
    }
    setSelectedItems(col.items || []);
  }

  async function handleCopy(item) {
    if (api) await api.copyItem(item.id);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const handleCreateCollection = () => {
    if (!newColName.trim()) return;
    const newCol = {
      id: 'custom-' + Date.now(),
      name: newColName.trim(),
      description: newColDesc.trim() || 'Custom user collection',
      color: newColColor,
      is_auto: false,
      count: 0,
      items: [],
      created_at: Date.now()
    };
    setCollections(prev => [newCol, ...prev]);
    setNewColName('');
    setNewColDesc('');
    setShowCreateModal(false);
  };

  const handleDeleteCustomCollection = (colId, e) => {
    e.stopPropagation();
    setCollections(prev => prev.filter(c => c.id !== colId));
    if (selected && selected.id === colId) {
      setSelected(null);
    }
  };

  // Filter collections
  const filteredCollections = collections.filter(c => {
    if (activeTab === 'auto' && !c.is_auto) return false;
    if (activeTab === 'custom' && c.is_auto) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const autoCollections = filteredCollections.filter(c => c.is_auto);
  const customCollections = filteredCollections.filter(c => !c.is_auto);

  // Filter items inside single collection view
  const filteredItems = selectedItems.filter(item => {
    if (!collectionQuery.trim()) return true;
    const q = collectionQuery.toLowerCase();
    return (item.title || '').toLowerCase().includes(q) || 
           (item.content || '').toLowerCase().includes(q);
  });

  // Single Collection View
  if (selected) {
    return (
      <>
        <div className="content-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button
                onClick={() => setSelected(null)}
                className="btn btn-ghost"
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                ← Back to Collections
              </button>
            </div>
            <h1 className="content-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="collection-header-dot" style={{ background: selected.color || 'var(--accent)' }} />
              {selected.name}
            </h1>
            <div className="content-subtitle">
              {filteredItems.length} {filteredItems.length === 1 ? 'memory' : 'memories'} stored
            </div>
          </div>

          <div className="header-actions">
            {selected.is_auto ? (
              <span className="badge-auto-tag">
                ✦ Smart Classification
              </span>
            ) : (
              <button 
                onClick={(e) => handleDeleteCustomCollection(selected.id, e)}
                className="btn btn-danger"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                Delete Collection
              </button>
            )}
          </div>
        </div>

        {/* Filter input inside collection */}
        <div className="search-container">
          <div className="search-input-wrap">
            <span className="search-icon"><Icons.Search style={{ width: 14, height: 14 }} /></span>
            <input
              type="text"
              className="search-input"
              placeholder={`Search within ${selected.name}...`}
              value={collectionQuery}
              onChange={e => setCollectionQuery(e.target.value)}
            />
            {collectionQuery && (
              <button
                style={{ color: 'var(--text-tertiary)', fontSize: 12, padding: '2px 6px', cursor: 'pointer' }}
                onClick={() => setCollectionQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="content-scroll">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icons.Folder style={{ width: 36, height: 36, color: 'var(--text-tertiary)' }} /></div>
              <div className="empty-title">
                {collectionQuery ? 'No matching memories found' : 'This collection is empty'}
              </div>
              <div className="empty-desc">
                {selected.is_auto 
                  ? `Copy content matching "${selected.name}" and it will automatically appear here.` 
                  : 'Add items to this collection from your recent feed.'}
              </div>
            </div>
          ) : (
            <div className="items-list">
              {filteredItems.map(item => (
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

  // Main Collections Directory View
  return (
    <>
      <div className="content-header">
        <div>
          <h1 className="content-title">Collections</h1>
          <div className="content-subtitle">
            Smart auto-folders and custom organized workspaces
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ fontSize: 11.5, padding: '6px 14px' }}
          onClick={() => setShowCreateModal(true)}
        >
          + New Collection
        </button>
      </div>

      {/* Directory Search & Filter Tabs */}
      <div className="search-container">
        <div className="search-input-wrap">
          <span className="search-icon"><Icons.Search style={{ width: 14, height: 14 }} /></span>
          <input
            type="text"
            className="search-input"
            placeholder="Search collections by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
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

      <div className="filter-bar">
        <button 
          className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Icons.Folder style={{ width: 12, height: 12 }} /> All ({collections.length})
        </button>
        <button 
          className={`filter-chip ${activeTab === 'auto' ? 'active' : ''}`}
          onClick={() => setActiveTab('auto')}
        >
          ✦ Smart Folders ({collections.filter(c => c.is_auto).length})
        </button>
        <button 
          className={`filter-chip ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          📁 Custom ({collections.filter(c => !c.is_auto).length})
        </button>
      </div>

      <div className="content-scroll">
        {loading ? (
          <div className="empty-state">
            <div style={{ color: 'var(--text-tertiary)' }}>Loading collections...</div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icons.Folder style={{ width: 40, height: 40, color: 'var(--text-tertiary)' }} /></div>
            <div className="empty-title">No collections found</div>
            <div className="empty-desc">
              Try adjusting your search query or create a new collection above.
            </div>
          </div>
        ) : (
          <div className="collections-container">
            {/* Auto Collections Section */}
            {autoCollections.length > 0 && (
              <div className="collection-group">
                <div className="collection-group-title">
                  <span>✦ Smart Auto-Folders</span>
                  <span className="collection-group-count">{autoCollections.length}</span>
                </div>
                <div className="collections-grid">
                  {autoCollections.map(col => (
                    <CollectionCard 
                      key={col.id} 
                      col={col} 
                      onClick={() => handleSelectCollection(col)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Collections Section */}
            {customCollections.length > 0 && (
              <div className="collection-group">
                <div className="collection-group-title">
                  <span>📁 Custom Workspaces</span>
                  <span className="collection-group-count">{customCollections.length}</span>
                </div>
                <div className="collections-grid">
                  {customCollections.map(col => (
                    <CollectionCard 
                      key={col.id} 
                      col={col} 
                      onClick={() => handleSelectCollection(col)}
                      onDelete={(e) => handleDeleteCustomCollection(col.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      {showCreateModal && (
        <div className="collection-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="collection-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Collection</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Collection Name</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="e.g. React Boilerplates, Design Tokens, API Keys..."
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Description (Optional)</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  placeholder="Brief summary of what goes in this collection..."
                  value={newColDesc}
                  onChange={e => setNewColDesc(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Color Accent</label>
                <div className="palette-picker">
                  {PALETTES.map(color => (
                    <span 
                      key={color}
                      className={`palette-swatch ${newColColor === color ? 'active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewColColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateCollection}
                disabled={!newColName.trim()}
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CollectionCard({ col, onClick, onDelete }) {
  return (
    <div className="collection-card" onClick={onClick} id={`collection-${col.id}`}>
      <div className="collection-accent-bar" style={{ background: col.color || 'var(--accent)' }} />
      
      <div className="col-card-top">
        <div className="col-icon-box" style={{ background: `${col.color || '#6366f1'}15`, color: col.color || '#6366f1' }}>
          <Icons.Folder style={{ width: 16, height: 16 }} />
        </div>
        <div className="col-top-meta">
          {col.is_auto ? (
            <span className="col-badge auto">Auto</span>
          ) : (
            <span className="col-badge custom">Custom</span>
          )}
          <span className="col-count-pill">{col.count || col.items?.length || 0} clips</span>
          {onDelete && (
            <button className="col-delete-btn" onClick={onDelete} title="Delete collection">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="collection-name">{col.name}</div>
      <div className="collection-description">{col.description || 'Collection workspace'}</div>

      {col.items && col.items.length > 0 ? (
        <div className="collection-preview-chips">
          {col.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="col-preview-chip">
              <span className="preview-chip-dot" style={{ background: col.color || 'var(--accent)' }} />
              <span className="preview-chip-text">
                {(item.title || item.content || '').substring(0, 28)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-empty-snippet">
          <span>Click to view and add clips →</span>
        </div>
      )}
    </div>
  );
}
