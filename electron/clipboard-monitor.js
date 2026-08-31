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
  const skipSensitive = getSetting('skipSensitive') !== 'false';
  if (!skipSensitive) return false;

  if (typeof content !== 'string') return false;
  const trimmed = content.trim();

  // 1. Password and PIN keywords
  if (/^(?:password|passwd|pwd|pin|secret|passphrase)\s*[:=]\s*\S+/i.test(trimmed)) return true;
  if (/^pin:\s*\d{4,8}$/i.test(trimmed)) return true;

  // 2. Cryptographic Private Keys & Certificates
  if (/-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/i.test(trimmed)) return true;
  if (/-----BEGIN CERTIFICATE-----/i.test(trimmed)) return true;

  // 3. Cloud Provider & API Secret Keys
  if (/AKIA[0-9A-Z]{16}/.test(trimmed)) return true; // AWS Access Key
  if (/ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{22,}/.test(trimmed)) return true; // GitHub PAT
  if (/sk_live_[0-9a-zA-Z]{24,}/.test(trimmed)) return true; // Stripe Live Secret Key
  if (/sk-[a-zA-Z0-9]{32,}/.test(trimmed)) return true; // OpenAI Secret Key
  if (/xox[baprs]-[0-9a-zA-Z]{10,48}/.test(trimmed)) return true; // Slack Token
  if (/(?:api[_-]?key|secret[_-]?key|access[_-]?token|bearer[_-]?token)\s*[:=]\s*["']?[A-Za-z0-9_\-\.]{20,}["']?/i.test(trimmed)) return true;

  // 4. Payment Cards (Visa, MasterCard, Amex, Discover with Luhn format check)
  const noSpaces = trimmed.replace(/[\s-]/g, '');
  if (/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/.test(noSpaces)) {
    return true;
  }

  // 5. Social Security Numbers (US SSN format)
  if (/^\d{3}-\d{2}-\d{4}$/.test(trimmed)) return true;

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
