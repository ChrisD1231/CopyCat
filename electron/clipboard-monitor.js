/**
 * Clipboard Monitor
 * Polls the system clipboard every 500ms, detects changes,
 * classifies content, and stores to database.
 */

const { clipboard } = require('electron');
const { classifyContent } = require('./classifier');
const { insertItem, getSetting } = require('./database');
const { addToIndex } = require('./search-engine');
const crypto = require('crypto');

let monitorInterval = null;
let lastHash = '';
let isPaused = false;
let pauseUntil = null;
let onNewItemCallback = null;

function hashContent(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function getActiveApp() {
  // In a real implementation, we'd use platform-specific APIs
  // For now, return null (source tracking is architecture-complete but OS-level)
  return null;
}

function checkClipboard() {
  // Check if paused
  if (isPaused) {
    if (pauseUntil && Date.now() > pauseUntil) {
      isPaused = false;
      pauseUntil = null;
    } else {
      return;
    }
  }

  try {
    // Check text content
    const text = clipboard.readText();
    
    if (text && text.trim()) {
      const hash = hashContent(text);
      
      if (hash !== lastHash) {
        lastHash = hash;
        processNewContent(text, 'text');
      }
      return;
    }
    
    // Check image content
    const image = clipboard.readImage();
    if (!image.isEmpty()) {
      const dataUrl = image.toDataURL();
      const hash = hashContent(dataUrl.substring(0, 200)); // Hash prefix for speed
      
      if (hash !== lastHash) {
        lastHash = hash;
        processNewContent(dataUrl, 'image');
      }
    }
  } catch (err) {
    // Clipboard access can fail intermittently
    console.warn('Clipboard read error:', err.message);
  }
}

function processNewContent(content, hint) {
  try {
    // Skip very short content (likely accidental)
    if (content.length < 2) return;
    
    // Skip sensitive patterns (password manager detection heuristics)
    if (isSensitive(content)) return;
    
    // Get source app
    const sourceApp = getActiveApp();
    
    // Classify content
    const classified = classifyContent(content, sourceApp);
    
    // Build full item
    const item = {
      content,
      ...classified,
      source_app: sourceApp,
    };
    
    // Store in database
    const stored = insertItem(item);
    
    if (stored) {
      // Add to search index
      addToIndex(stored);
      
      // Notify listeners
      if (onNewItemCallback) {
        onNewItemCallback(stored);
      }
    }
  } catch (err) {
    console.error('Error processing clipboard content:', err);
  }
}

function isSensitive(content) {
  // Basic sensitive content detection
  const lower = content.toLowerCase();
  
  // Password patterns
  if (/^password:\s*/i.test(content)) return true;
  if (/^pin:\s*\d{4,8}$/i.test(content)) return true;
  
  // Private keys
  if (/-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/.test(content)) return true;
  if (/-----BEGIN PGP PRIVATE KEY BLOCK-----/.test(content)) return true;
  
  // AWS/secret keys (basic pattern)
  if (/(?:api[_-]?key|secret[_-]?key|private[_-]?key)\s*[:=]\s*\S{20,}/i.test(content)) return true;
  
  // SSH keys
  if (/^ssh-(rsa|ed25519|ecdsa)\s+AAAA/.test(content)) return true;
  
  // Credit card numbers (basic Luhn-ish pattern)
  const noSpaces = content.replace(/[\s-]/g, '');
  if (/^\d{16}$/.test(noSpaces) && noSpaces.length === 16) return true;
  
  return false;
}

function startClipboardMonitor(callback) {
  onNewItemCallback = callback;
  
  const interval = parseInt(getSetting('pollInterval') || '500');
  
  monitorInterval = setInterval(checkClipboard, interval);
  console.log(`Clipboard monitor started (${interval}ms interval)`);
}

function stopClipboardMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

function pauseMonitor(duration) {
  isPaused = true;
  
  if (duration === 'forever') {
    pauseUntil = null;
  } else if (typeof duration === 'number') {
    pauseUntil = Date.now() + duration;
  } else {
    switch (duration) {
      case '15min': pauseUntil = Date.now() + 15 * 60 * 1000; break;
      case '1hour': pauseUntil = Date.now() + 60 * 60 * 1000; break;
      case 'tomorrow': {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        pauseUntil = tomorrow.getTime();
        break;
      }
      default: pauseUntil = null;
    }
  }
  
  console.log(`Clipboard monitor paused until ${pauseUntil ? new Date(pauseUntil).toLocaleString() : 'resumed manually'}`);
}

function resumeMonitor() {
  isPaused = false;
  pauseUntil = null;
  console.log('Clipboard monitor resumed');
}

function getMonitorStatus() {
  return {
    isRunning: !!monitorInterval,
    isPaused,
    pauseUntil,
  };
}

module.exports = {
  startClipboardMonitor,
  stopClipboardMonitor,
  pauseMonitor,
  resumeMonitor,
  getMonitorStatus,
};
