/**
 * Database module using sql.js (pure WebAssembly SQLite — no native compilation needed)
 */

const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const crypto = require('crypto');

let SQL;
let db;
let dbPath;
let saveTimer;

// Lazy-load sql.js
function getSql() {
  if (!SQL) {
    SQL = require('sql.js');
  }
  return SQL;
}

function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'copycat.db');
}

async function initDatabase() {
  dbPath = getDbPath();
  
  // Initialize sql.js
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();
  
  // Load existing DB or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create schema
  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'text',
      content_hash TEXT NOT NULL,
      title TEXT,
      description TEXT,
      tags TEXT DEFAULT '[]',
      source_app TEXT,
      source_url TEXT,
      source_domain TEXT,
      favicon_url TEXT,
      color_hex TEXT,
      color_name TEXT,
      preview_text TEXT,
      is_favorite INTEGER DEFAULT 0,
      use_count INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_used_at INTEGER,
      collection_hint TEXT,
      tfidf_vector TEXT DEFAULT '{}'
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_hash ON clipboard_items(content_hash);
    CREATE INDEX IF NOT EXISTS idx_created ON clipboard_items(created_at);
    CREATE INDEX IF NOT EXISTS idx_type ON clipboard_items(content_type);

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '📁',
      color TEXT DEFAULT '#6366f1',
      is_auto INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (collection_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Save to disk periodically
  scheduleSave();
  
  console.log('Database initialized at:', dbPath);
  return db;
}

function scheduleSave() {
  if (saveTimer) clearInterval(saveTimer);
  saveTimer = setInterval(saveDatabase, 5000);
}

function saveDatabase() {
  if (!db || !dbPath) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 32);
}

function cleanParamsArray(params) {
  return params.map(p => p === undefined ? null : p);
}

function runQuery(sql, params = []) {
  const clean = cleanParamsArray(params);
  db.run(sql, clean);
}

function getOne(sql, params = []) {
  const clean = cleanParamsArray(params);
  const stmt = db.prepare(sql);
  const result = stmt.getAsObject(clean);
  stmt.free();
  if (result && Object.keys(result).length > 0 && result.id !== undefined) return result;
  return null;
}

function getAll(sql, params = []) {
  const clean = cleanParamsArray(params);
  const stmt = db.prepare(sql);
  if (clean.length > 0) {
    stmt.bind(clean);
  }
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}


function deserializeItem(item) {
  if (!item) return null;
  
  let tags = [];
  try {
    tags = typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []);
  } catch (e) {
    tags = [];
  }

  let tfidf = {};
  try {
    tfidf = typeof item.tfidf_vector === 'string' ? JSON.parse(item.tfidf_vector || '{}') : (item.tfidf_vector || {});
  } catch (e) {
    tfidf = {};
  }

  return {
    ...item,
    tags,
    tfidf_vector: tfidf,
    is_favorite: !!item.is_favorite,
    use_count: item.use_count || 1,
  };
}


// ─── Item CRUD ────────────────────────────────────────────────────────────────

function insertItem(item) {
  const now = item.created_at || Date.now();
  const id = generateId();
  const hash = hashContent(item.content);

  // Check duplicate
  const existing = getOne('SELECT id FROM clipboard_items WHERE content_hash = ?', [hash]);
  if (existing) {
    runQuery(
      'UPDATE clipboard_items SET updated_at = ?, use_count = use_count + 1 WHERE id = ?',
      [Date.now(), existing.id]
    );
    saveDatabase();
    return null;
  }

  runQuery(`
    INSERT INTO clipboard_items (
      id, content, content_type, content_hash, title, description, tags,
      source_app, source_url, source_domain, favicon_url, color_hex, color_name,
      preview_text, is_favorite, use_count, created_at, updated_at, last_used_at,
      collection_hint, tfidf_vector
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?, ?, ?
    )
  `, [
    id,
    item.content,
    item.content_type || 'text',
    hash,
    item.title || null,
    item.description || null,
    JSON.stringify(item.tags || []),
    item.source_app || null,
    item.source_url || null,
    item.source_domain || null,
    item.favicon_url || null,
    item.color_hex || null,
    item.color_name || null,
    item.preview_text || (item.content || '').substring(0, 200),
    now,
    item.updated_at || now,
    item.last_used_at || now,
    item.collection_hint || null,
    JSON.stringify(item.tfidf_vector || {}),
  ]);

  saveDatabase();

  return deserializeItem({
    ...item,
    id,
    content_hash: hash,
    created_at: now,
    updated_at: item.updated_at || now,
  });
}

function getItem(id) {
  const item = getOne('SELECT * FROM clipboard_items WHERE id = ?', [id]);
  return deserializeItem(item);
}

function getRecentItems(limit = 50) {
  const items = getAll(
    'SELECT * FROM clipboard_items ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return items.map(deserializeItem);
}

function getItemsByType(type, limit = 50) {
  if (type === 'all') return getRecentItems(limit);
  const items = getAll(
    'SELECT * FROM clipboard_items WHERE content_type = ? ORDER BY created_at DESC LIMIT ?',
    [type, limit]
  );
  return items.map(deserializeItem);
}

function searchItems(query, limit = 30) {
  const q = `%${query.toLowerCase()}%`;
  const items = getAll(`
    SELECT * FROM clipboard_items
    WHERE 
      LOWER(content) LIKE ? OR
      LOWER(description) LIKE ? OR
      LOWER(title) LIKE ? OR
      LOWER(tags) LIKE ? OR
      LOWER(source_domain) LIKE ?
    ORDER BY created_at DESC
    LIMIT ?
  `, [q, q, q, q, q, limit]);
  return items.map(deserializeItem);
}

function getFavorites() {
  const items = getAll(
    'SELECT * FROM clipboard_items WHERE is_favorite = 1 ORDER BY updated_at DESC'
  );
  return items.map(deserializeItem);
}

function toggleFavorite(id) {
  const item = getOne('SELECT is_favorite FROM clipboard_items WHERE id = ?', [id]);
  if (!item) return false;
  const newValue = item.is_favorite ? 0 : 1;
  runQuery(
    'UPDATE clipboard_items SET is_favorite = ?, updated_at = ? WHERE id = ?',
    [newValue, Date.now(), id]
  );
  saveDatabase();
  return newValue === 1;
}

function updateItemUsage(id) {
  runQuery(
    'UPDATE clipboard_items SET use_count = use_count + 1, last_used_at = ?, updated_at = ? WHERE id = ?',
    [Date.now(), Date.now(), id]
  );
  saveDatabase();
}

function deleteItem(id) {
  runQuery('DELETE FROM clipboard_items WHERE id = ?', [id]);
  saveDatabase();
  return true;
}

function clearAll() {
  runQuery('DELETE FROM clipboard_items');
  runQuery('DELETE FROM collection_items');
  saveDatabase();
  return true;
}

function getAllItemsForIndex() {
  const items = getAll('SELECT * FROM clipboard_items ORDER BY created_at DESC');
  return items.map(deserializeItem);
}

// ─── Collections ──────────────────────────────────────────────────────────────

function getCollections() {
  const cols = getAll('SELECT * FROM collections ORDER BY is_auto DESC, name ASC');
  return cols.map(col => {
    const items = getAll(`
      SELECT ci.* FROM clipboard_items ci
      JOIN collection_items coli ON coli.item_id = ci.id
      WHERE coli.collection_id = ?
      ORDER BY coli.added_at DESC
      LIMIT 5
    `, [col.id]).map(deserializeItem);

    const countRow = getOne(
      'SELECT COUNT(*) as c FROM collection_items WHERE collection_id = ?',
      [col.id]
    );

    return { ...col, items, count: countRow?.c || 0, is_auto: !!col.is_auto };
  });
}

function createCollection(name, description, icon, color, isAuto) {
  const id = generateId();
  const now = Date.now();
  runQuery(`
    INSERT INTO collections (id, name, description, icon, color, is_auto, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, name, description || '', icon || '📁', color || '#6366f1', isAuto ? 1 : 0, now, now]);
  saveDatabase();
  return id;
}

function addToCollection(collectionId, itemId) {
  try {
    runQuery(
      'INSERT OR IGNORE INTO collection_items (collection_id, item_id, added_at) VALUES (?, ?, ?)',
      [collectionId, itemId, Date.now()]
    );
    saveDatabase();
    return true;
  } catch { return false; }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function getSetting(key) {
  const row = getOne('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

function setSetting(key, value) {
  runQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  saveDatabase();
}

function getDb() { return db; }

module.exports = {
  initDatabase,
  getDb,
  insertItem,
  getItem,
  getRecentItems,
  getItemsByType,
  searchItems,
  getFavorites,
  toggleFavorite,
  updateItemUsage,
  deleteItem,
  clearAll,
  getCollections,
  createCollection,
  addToCollection,
  getSetting,
  setSetting,
  generateId,
  hashContent,
  getAllItemsForIndex,
  saveDatabase,
};
