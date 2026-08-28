const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe, typed API to the renderer process
contextBridge.exposeInMainWorld('copycat', {
  // Search
  search: (query) => ipcRenderer.invoke('search', query),
  getRecent: (limit) => ipcRenderer.invoke('get-recent', limit),
  getItem: (id) => ipcRenderer.invoke('get-item', id),
  getByType: (type, limit) => ipcRenderer.invoke('get-by-type', type, limit),

  // Collections & Favorites
  getCollections: () => ipcRenderer.invoke('get-collections'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  toggleFavorite: (id) => ipcRenderer.invoke('toggle-favorite', id),

  // Clipboard
  copyItem: (id) => ipcRenderer.invoke('copy-item', id),
  deleteItem: (id) => ipcRenderer.invoke('delete-item', id),
  clearAll: () => ipcRenderer.invoke('clear-all'),

  // Overlay controls
  hideOverlay: () => ipcRenderer.send('overlay:hide'),
  openMain: () => ipcRenderer.send('overlay:open-main'),

  // Monitor controls
  pauseMonitor: (duration) => ipcRenderer.invoke('pause-monitor', duration),
  resumeMonitor: () => ipcRenderer.invoke('resume-monitor'),
  getMonitorStatus: () => ipcRenderer.invoke('get-monitor-status'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', key, value),

  // Event listeners
  onNewItem: (callback) => {
    ipcRenderer.on('clipboard:new-item', (_, item) => callback(item));
    return () => ipcRenderer.removeAllListeners('clipboard:new-item');
  },
  onOverlayFocus: (callback) => {
    ipcRenderer.on('overlay:focus', callback);
    return () => ipcRenderer.removeAllListeners('overlay:focus');
  },
  onOverlayClose: (callback) => {
    ipcRenderer.on('overlay:close', callback);
    return () => ipcRenderer.removeAllListeners('overlay:close');
  },

  // External links
  openUrl: (url) => ipcRenderer.send('open-url', url),

  // Platform info
  platform: process.platform,
});
