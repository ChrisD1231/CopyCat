import { useState } from 'react';
import { Icons } from './Icons.jsx';

const TYPE_META = {
  code:    { icon: <Icons.Code />, color: 'var(--type-code)',    label: 'Code'    },
  url:     { icon: <Icons.Link />, color: 'var(--type-url)',     label: 'Link'    },
  color:   { icon: <Icons.Color />, color: 'var(--type-color)',   label: 'Color'   },
  email:   { icon: <Icons.Email />, color: 'var(--type-email)',   label: 'Email'   },
  phone:   { icon: <Icons.Phone />, color: 'var(--type-phone)',   label: 'Phone'   },
  image:   { icon: <Icons.Image />, color: 'var(--type-image)',   label: 'Image'   },
  prompt:  { icon: <Icons.Prompt />, color: 'var(--type-prompt)',  label: 'Prompt'  },
  address: { icon: <Icons.Address />, color: 'var(--type-address)', label: 'Address' },
  text:    { icon: <Icons.Text />, color: 'var(--type-text)',    label: 'Text'    },
};

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.text;
}

function formatDate(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (secs < 60)    return 'just now';
  if (mins < 60)    return `${mins}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  if (days < 7)     return `${days}d ago`;
  if (weeks < 5)    return `${weeks}w ago`;
  return `${months}mo ago`;
}

export default function ClipboardItem({ item, onCopy, onFavorite, onDelete, isCopied, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const meta = getTypeMeta(item.content_type);

  return (
    <div
      id={`item-${item.id}`}
      className={`clipboard-item ${isSelected ? 'selected' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onCopy}
    >
      {/* Type icon */}
      <div
        className="item-type-icon"
        style={{ background: `${meta.color}18` }}
      >
        {item.content_type === 'color' && item.color_hex ? (
          <div
            className="item-color-swatch"
            style={{ background: item.color_hex, width: 28, height: 28, borderRadius: 6 }}
          />
        ) : item.content_type === 'url' && item.favicon_url ? (
          <img
            src={item.favicon_url}
            alt=""
            className="item-url-favicon"
            style={{ width: 18, height: 18, borderRadius: 3 }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span style={{ fontSize: 14 }}>{meta.icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="item-body">
        <div className="item-title">{item.title || item.content?.substring(0, 60)}</div>
        
        <div className="item-meta">
          <span className="item-type-badge" style={{ color: meta.color }}>
            {meta.label}
          </span>
          {item.source_domain && (
            <>
              <span className="item-dot" />
              <span className="item-date">{item.source_domain}</span>
            </>
          )}
          <span className="item-dot" />
          <span className="item-date">{formatDate(item.created_at)}</span>
          {item.use_count > 1 && (
            <>
              <span className="item-dot" />
              <span className="item-date">Used {item.use_count}×</span>
            </>
          )}
        </div>

        {item.description && (
          <div className="item-description">{item.description}</div>
        )}

        {/* Code preview */}
        {item.content_type === 'code' && item.content && (
          <div className="item-code-preview">
            {item.content.split('\n').slice(0, 2).join('\n').substring(0, 120)}
          </div>
        )}

        {/* Color swatch bar */}
        {item.content_type === 'color' && item.color_hex && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div
              style={{
                width: 80,
                height: 20,
                borderRadius: 4,
                background: item.color_hex,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {item.color_hex}
            </span>
            {item.color_name && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                · {item.color_name}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && hovered && (
          <div className="item-tags" style={{ marginTop: 6 }}>
            {item.tags.slice(0, 5).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="item-actions">
        {isCopied ? (
          <span style={{ fontSize: 11, color: 'var(--accent-green)', padding: '0 6px', fontWeight: 500 }}>
            ✓
          </span>
        ) : (
          <>
            <button
              className={`action-btn favorite ${item.is_favorite ? 'active' : ''}`}
              title={item.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={e => { e.stopPropagation(); onFavorite(); }}
            >
              <Icons.Star filled={item.is_favorite} style={{ width: 13, height: 13 }} />
            </button>
            <button
              className="action-btn copy"
              title="Copy to clipboard"
              onClick={e => { e.stopPropagation(); onCopy(); }}
            >
              <Icons.Copy style={{ width: 13, height: 13 }} />
            </button>
            <button
              className="action-btn"
              title="Delete"
              style={{ color: 'var(--text-tertiary)' }}
              onClick={e => { e.stopPropagation(); onDelete(); }}
            >
              <Icons.Trash style={{ width: 13, height: 13 }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export { getTypeMeta, formatDate };
