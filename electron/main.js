const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, nativeImage, shell } = require('electron');
const path = require('path');
const { setupTray } = require('./tray');
const { initDatabase } = require('./database');
const { startClipboardMonitor, stopClipboardMonitor, pauseMonitor, resumeMonitor } = require('./clipboard-monitor');
const { searchItems, getRecentItems, getCollections, getFavorites, toggleFavorite, deleteItem, clearAll, getItem, updateItemUsage } = require('./database');
const { search } = require('./search-engine');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

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
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    show: false,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/index.html');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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
    overlayWindow.loadURL('http://localhost:5173/overlay.html');
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'));
  }

  // Center on screen
  overlayWindow.center();

  overlayWindow.on('blur', () => {
    hideOverlay();
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
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
  overlayWindow.center();
  overlayWindow.show();
  overlayWindow.focus();
  overlayWindow.webContents.send('overlay:focus');
  isOverlayVisible = true;
}

function hideOverlay() {
  if (overlayWindow && isOverlayVisible) {
    overlayWindow.webContents.send('overlay:close');
    setTimeout(() => {
      overlayWindow?.hide();
    }, 180); // Wait for close animation
    isOverlayVisible = false;
  }
}

function toggleOverlay() {
  if (isOverlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

// ─── Global Shortcut ─────────────────────────────────────────────────────────

function registerGlobalShortcut() {
  const { getSetting } = require('./database');
  const shortcut = getSetting('shortcut') || 'Alt+C';
  const registered = globalShortcut.register(shortcut, toggleOverlay);
  
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
      excludedApps: JSON.parse(getSetting('excludedApps') || '[]'),
      captureEnabled: getSetting('captureEnabled') !== 'false',
      maxItems: parseInt(getSetting('maxItems') || '10000'),
    };
  });

  ipcMain.handle('save-setting', async (_, key, value) => {
    const { setSetting } = require('./database');
    setSetting(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
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
