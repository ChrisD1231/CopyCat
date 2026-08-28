/**
 * TF-IDF Semantic Search Engine
 * Provides near-instant semantic search over clipboard items.
 * Architecture is ready for real embedding vectors (OpenAI, Ollama, etc.)
 */

const { getAllItemsForIndex } = require('./database');

let index = new Map(); // id -> document
let vocabulary = new Map(); // term -> { idf, postings: Map(id -> tf) }
let isBuilt = false;

// ─── Text Normalization ────────────────────────────────────────────────────────

// Synonym map for semantic understanding
const SYNONYMS = {
  'animation': ['animate', 'animated', 'animating', 'motion', 'movement', 'transition', 'scroll', 'scrolling'],
  'code': ['snippet', 'script', 'function', 'component', 'module', 'program'],
  'boat': ['marine', 'nautical', 'vessel', 'ship', 'wake', 'sailing', 'water'],
  'color': ['colour', 'hex', 'rgb', 'hsl', 'palette', 'hue', 'shade', 'tint'],
  'green': ['teal', 'seafoam', 'mint', 'emerald', 'sage'],
  'blue': ['navy', 'indigo', 'azure', 'cobalt', 'sapphire', 'sky'],
  'red': ['crimson', 'scarlet', 'rose', 'ruby'],
  'photo': ['image', 'picture', 'img', 'photograph', 'pic'],
  'website': ['site', 'url', 'link', 'page', 'web'],
  'scroll': ['scrolling', 'parallax', 'gsap', 'scrolltrigger'],
  'construction': ['build', 'building', 'contractor', 'lighthouse'],
  'prompt': ['instruction', 'query', 'request', 'ask', 'generate'],
  'smooth': ['fluid', 'silky', 'buttery', 'seamless'],
  'react': ['jsx', 'tsx', 'component', 'hook', 'useState', 'useEffect'],
  'javascript': ['js', 'typescript', 'ts', 'node', 'es6'],
  'css': ['stylesheet', 'style', 'sass', 'scss'],
  'design': ['ui', 'ux', 'figma', 'interface', 'visual', 'aesthetic'],
  'contact': ['email', 'phone', 'address', 'person', 'number'],
  'api': ['endpoint', 'fetch', 'request', 'http', 'rest', 'graphql'],
  'database': ['sql', 'query', 'table', 'schema', 'db'],
  '3d': ['three', 'threejs', 'webgl', 'mesh', 'geometry', 'scene'],
  'inspiration': ['reference', 'example', 'inspo', 'mood'],
};

// Build reverse synonym map
const REVERSE_SYNONYMS = new Map();
for (const [canonical, synonyms] of Object.entries(SYNONYMS)) {
  for (const syn of synonyms) {
    if (!REVERSE_SYNONYMS.has(syn)) REVERSE_SYNONYMS.set(syn, new Set());
    REVERSE_SYNONYMS.get(syn).add(canonical);
    for (const otherSyn of synonyms) {
      if (otherSyn !== syn) {
        REVERSE_SYNONYMS.get(syn).add(otherSyn);
      }
    }
  }
}

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s#]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function expandWithSynonyms(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    if (REVERSE_SYNONYMS.has(token)) {
      REVERSE_SYNONYMS.get(token).forEach(syn => expanded.add(syn));
    }
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach(syn => expanded.add(syn));
    }
  }
  return Array.from(expanded);
}

function buildDocumentText(item) {
  const parts = [
    item.content || '',
    item.title || '',
    item.description || '',
    (item.tags || []).join(' '),
    item.source_domain || '',
    item.color_name || '',
    item.content_type || '',
    // Expand type into searchable words
    item.content_type === 'url' ? 'website link url' : '',
    item.content_type === 'color' ? 'color colour hex palette' : '',
    item.content_type === 'code' ? 'code snippet script' : '',
    item.content_type === 'prompt' ? 'prompt ai instruction' : '',
    item.content_type === 'image' ? 'image photo picture' : '',
  ];
  return parts.join(' ');
}

// ─── TF-IDF Index ─────────────────────────────────────────────────────────────

function computeTF(tokens) {
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  const max = Math.max(...freq.values());
  const tf = new Map();
  for (const [token, count] of freq) {
    tf.set(token, count / max); // Normalized TF
  }
  return tf;
}

function buildIndex() {
  const items = getAllItemsForIndex();
  
  index.clear();
  vocabulary.clear();
  
  // Build document vectors
  const docTerms = new Map();
  
  for (const item of items) {
    const text = buildDocumentText(item);
    const tokens = tokenize(text);
    const expanded = expandWithSynonyms(tokens);
    const tf = computeTF(expanded);
    
    docTerms.set(item.id, tf);
    index.set(item.id, item);
    
    // Track document frequency per term
    for (const [term] of tf) {
      if (!vocabulary.has(term)) {
        vocabulary.set(term, { df: 0, postings: new Map() });
      }
      vocabulary.get(term).df++;
      vocabulary.get(term).postings.set(item.id, tf.get(term));
    }
  }
  
  const N = items.length || 1;
  
  // Compute IDF
  for (const [term, data] of vocabulary) {
    data.idf = Math.log((N + 1) / (data.df + 1)) + 1; // Smoothed IDF
  }
  
  isBuilt = true;
  console.log(`Search index built: ${items.length} items, ${vocabulary.size} terms`);
}

function addToIndex(item) {
  const text = buildDocumentText(item);
  const tokens = tokenize(text);
  const expanded = expandWithSynonyms(tokens);
  const tf = computeTF(expanded);
  
  index.set(item.id, item);
  
  const N = index.size;
  
  for (const [term, tfVal] of tf) {
    if (!vocabulary.has(term)) {
      vocabulary.set(term, { df: 0, postings: new Map(), idf: 1 });
    }
    const entry = vocabulary.get(term);
    if (!entry.postings.has(item.id)) {
      entry.df++;
      entry.idf = Math.log((N + 1) / (entry.df + 1)) + 1;
    }
    entry.postings.set(item.id, tfVal);
  }
}

// ─── Search ────────────────────────────────────────────────────────────────────

function search(query, limit = 20) {
  if (!isBuilt) {
    buildIndex();
  }
  
  if (!query || !query.trim()) {
    return Array.from(index.values())
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
  }

  const queryTokens = tokenize(query);
  const expandedQuery = expandWithSynonyms(queryTokens);
  
  // Score each document
  const scores = new Map();
  
  for (const term of expandedQuery) {
    if (!vocabulary.has(term)) continue;
    
    const { idf, postings } = vocabulary.get(term);
    
    for (const [docId, tf] of postings) {
      const tfidf = tf * idf;
      scores.set(docId, (scores.get(docId) || 0) + tfidf);
    }
  }
  
  if (scores.size === 0) {
    // Fallback: substring search
    const q = query.toLowerCase();
    const fallback = [];
    for (const item of index.values()) {
      const text = buildDocumentText(item).toLowerCase();
      if (text.includes(q)) {
        fallback.push(item);
      }
    }
    return fallback.slice(0, limit);
  }
  
  // Apply boost factors
  const now = Date.now();
  const oneDay = 86400000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  
  const rankedResults = Array.from(scores.entries())
    .map(([id, score]) => {
      const item = index.get(id);
      if (!item) return null;
      
      let finalScore = score;
      
      // Recency boost
      const age = now - item.created_at;
      if (age < oneDay) finalScore *= 1.5;
      else if (age < oneWeek) finalScore *= 1.3;
      else if (age < oneMonth) finalScore *= 1.1;
      
      // Favorite boost
      if (item.is_favorite) finalScore *= 1.4;
      
      // Usage boost
      finalScore *= (1 + Math.log(1 + (item.use_count || 1)) * 0.1);
      
      // Exact phrase boost
      const itemText = buildDocumentText(item).toLowerCase();
      if (itemText.includes(query.toLowerCase())) finalScore *= 2.0;
      
      return { item, score: finalScore };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.item);
  
  return rankedResults;
}

function rebuildIndex() {
  isBuilt = false;
  buildIndex();
}

// ─── Stop Words ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  'it', 'its', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'his',
  'she', 'her', 'they', 'their', 'what', 'which', 'who', 'how', 'when',
  'where', 'why', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'get', 'use', 'used',
]);

module.exports = { search, buildIndex, addToIndex, rebuildIndex };
