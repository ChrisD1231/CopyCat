const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, nativeImage, shell } = require('electron');
const path = require('path');
const { setupTray } = require('./tray');
const { initDatabase } = require('./database');
const { startClipboardMonitor, stopClipboardMonitor, pauseMonitor, resumeMonitor } = require('./clipboard-monitor');
const { searchItems, getRecentItems, getCollections, getFavorites, toggleFavorite, deleteItem, clearAll, getItem, updateItemUsage } = require('./database');
const { search } = require('./search-engine');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let overlayWindow = null;
let isOverlayVisible = false;

// ─── App Setup ────────────────────────────────────────────────────────────────

app.setName('Copycat');

// Hide from dock on macOS (menu bar app)
if (process.platform === 'darwin') {
  app.dock?.hide();
}

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ─── Window Creation ──────────────────────────────────────────────────────────

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hidden',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#08080a',
      symbolColor: '#8a8a93',
      height: 36
    } : false,
    show: true,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.setAlwaysOnTop(true);
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Hide instead of close on macOS
  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin' && !app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

let lastShownTime = 0;

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 660,
    height: 520,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    vibrancy: 'ultra-dark', // macOS blur
    visualEffectState: 'active',
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    overlayWindow.loadURL('http://127.0.0.1:5173/overlay.html');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'));
  }

  // Center on screen
  overlayWindow.center();

  overlayWindow.on('blur', () => {
    // Ignore blur events immediately after opening to prevent Windows Alt-key release focus loss
    if (Date.now() - lastShownTime < 350) {
      return;
    }
    hideOverlay();
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    isOverlayVisible = false;
  });
}

function getAppIcon() {
  try {
    const iconPath = path.join(__dirname, '../assets/icon.png');
    return iconPath;
  } catch {
    return undefined;
  }
}

// ─── Overlay Controls ─────────────────────────────────────────────────────────

function showOverlay() {
  if (!overlayWindow) {
    createOverlayWindow();
  }
  lastShownTime = Date.now();
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.center();
  overlayWindow.show();
  overlayWindow.focus();
  overlayWindow.webContents.send('overlay:focus');
  isOverlayVisible = true;
  console.log('[Overlay] showOverlay triggered at', new Date().toISOString());
}

function hideOverlay() {
  if (overlayWindow && overlayWindow.isVisible()) {
    console.log('[Overlay] hideOverlay triggered at', new Date().toISOString());
    overlayWindow.webContents.send('overlay:close');
    setTimeout(() => {
      overlayWindow?.hide();
    }, 180); // Wait for close animation
    isOverlayVisible = false;
  }
}

function toggleOverlay() {
  console.log('[Overlay] toggleOverlay triggered, currently visible:', isOverlayVisible);
  if (overlayWindow && overlayWindow.isVisible() && isOverlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// ─── Global Shortcut ─────────────────────────────────────────────────────────

function registerGlobalShortcut() {
  globalShortcut.unregisterAll();
  const { getSetting, setSetting } = require('./database');
  let shortcut = getSetting('shortcut');
  if (!shortcut) {
    shortcut = 'Alt+C';
    setSetting('shortcut', 'Alt+C');
  }
  
  const registered = globalShortcut.register(shortcut, () => {
    console.log(`[Shortcut] ${shortcut} triggered`);
    toggleOverlay();
  });
  
  // Register fallback shortcuts in case Alt+C is intercepted by system GPU drivers (AMD/NVIDIA)
  try {
    globalShortcut.register('Alt+V', () => {
      console.log('[Shortcut] Alt+V triggered');
      toggleOverlay();
    });
  } catch (e) {}

  try {
    globalShortcut.register('CommandOrControl+Shift+V', () => {
      console.log('[Shortcut] Ctrl+Shift+V triggered');
      toggleOverlay();
    });
  } catch (e) {}

  if (!registered) {
    console.error('Failed to register global shortcut:', shortcut);
  } else {
    console.log('Global shortcut registered:', shortcut);
  }
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

function setupIPC() {
  // Overlay controls
  ipcMain.on('overlay:hide', () => hideOverlay());
  ipcMain.on('overlay:open-main', () => {
    hideOverlay();
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });

  // Search
  ipcMain.handle('search', async (_, query) => {
    if (!query || query.trim() === '') {
      return getRecentItems(20);
    }
    return search(query);
  });

  // Recent items
  ipcMain.handle('get-recent', async (_, limit = 50) => {
    return getRecentItems(limit);
  });

  // Get single item
  ipcMain.handle('get-item', async (_, id) => {
    return getItem(id);
  });

  // Collections
  ipcMain.handle('get-collections', async () => {
    return getCollections();
  });

  // Favorites
  ipcMain.handle('get-favorites', async () => {
    return getFavorites();
  });

  ipcMain.handle('toggle-favorite', async (_, id) => {
    return toggleFavorite(id);
  });

  // Copy item back to clipboard
  ipcMain.handle('copy-item', async (_, id) => {
    const item = getItem(id);
    if (!item) return false;
    
    updateItemUsage(id);
    
    if (item.content_type === 'image') {
      try {
        const img = nativeImage.createFromDataURL(item.content);
        clipboard.writeImage(img);
      } catch {
        clipboard.writeText(item.content);
      }
    } else {
      clipboard.writeText(item.content);
    }
    
    return true;
  });

  // Delete item
  ipcMain.handle('delete-item', async (_, id) => {
    return deleteItem(id);
  });

  // Clear all
  ipcMain.handle('clear-all', async () => {
    return clearAll();
  });

  // Pause/Resume monitor
  ipcMain.handle('pause-monitor', async (_, duration) => {
    pauseMonitor(duration);
    return true;
  });

  ipcMain.handle('resume-monitor', async () => {
    resumeMonitor();
    return true;
  });

  ipcMain.handle('get-monitor-status', async () => {
    const { getMonitorStatus } = require('./clipboard-monitor');
    return getMonitorStatus();
  });

  // Settings
  ipcMain.handle('get-settings', async () => {
    const { getSetting } = require('./database');
    return {
      shortcut: getSetting('shortcut') || 'Alt+C',
      pollInterval: parseInt(getSetting('pollInterval') || '500'),
      autoDelete: getSetting('autoDelete') || 'never',
      excludedApps: JSON.parse(getSetting('excludedApps') || '["1Password.exe", "Bitwarden.exe", "KeePass.exe", "KeePassXC.exe", "Dashlane.exe"]'),
      excludePasswords: getSetting('excludePasswords') !== 'false',
      skipSensitive: getSetting('skipSensitive') !== 'false',
      captureEnabled: getSetting('captureEnabled') !== 'false',
      maxItems: parseInt(getSetting('maxItems') || '10000'),
    };
  });

  ipcMain.handle('save-setting', async (_, key, value) => {
    const { setSetting } = require('./database');
    setSetting(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    if (key === 'shortcut') {
      registerGlobalShortcut();
    }
    return true;
  });

  // Filter by type
  ipcMain.handle('get-by-type', async (_, type, limit = 50) => {
    const { getItemsByType } = require('./database');
    return getItemsByType(type, limit);
  });

  // Open URLs externally
  ipcMain.on('open-url', (_, url) => {
    shell.openExternal(url);
  });
}

// ─── App Events ───────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Init database first (sql.js is async)
  await initDatabase();

  // Seed demo data on first launch
  const { getSetting, setSetting } = require('./database');
  if (!getSetting('seeded')) {
    const { seedDemoData } = require('./seed-data');
    seedDemoData();
    setSetting('seeded', 'true');
  }

  // Setup IPC
  setupIPC();

  // Create main window
  createMainWindow();

  // Create overlay (pre-load for speed)
  createOverlayWindow();

  // Register global shortcut
  registerGlobalShortcut();

  // Setup tray
  setupTray({
    showOverlay,
    showMain: () => {
      if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
      else createMainWindow();
    },
    pauseMonitor,
    resumeMonitor,
    quit: () => {
      app.isQuitting = true;
      app.quit();
    },
  });

  // Start clipboard monitoring
  startClipboardMonitor((newItem) => {
    // Notify all windows of new clipboard item
    mainWindow?.webContents.send('clipboard:new-item', newItem);
    overlayWindow?.webContents.send('clipboard:new-item', newItem);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopClipboardMonitor();
});

app.on('window-all-closed', () => {
  // Keep running in tray on all platforms for a clipboard manager
  // Don't quit when all windows are closed
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
});

module.exports = { showOverlay, hideOverlay };
