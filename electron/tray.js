const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

let tray = null;
let isPaused = false;

function setupTray({ showOverlay, showMain, pauseMonitor, resumeMonitor, quit }) {
  // Create tray icon from file or generate one
  let icon;
  try {
    const iconPath = path.join(__dirname, '../assets/tray-icon.png');
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) throw new Error('Empty icon');
  } catch {
    // Create a minimal programmatic icon
    icon = nativeImage.createEmpty();
  }

  // On macOS, template images work better (automatically inverts for light/dark)
  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 18, height: 18 });
  } else {
    icon = icon.resize({ width: 24, height: 24 });
  }

  tray = new Tray(icon);
  tray.setToolTip('Copycat — Copy it once. Find it forever.');

  function buildMenu() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🐱 Copycat',
        enabled: false,
        icon: icon.resize ? icon.resize({ width: 16, height: 16 }) : undefined,
      },
      { type: 'separator' },
      {
        label: `${isPaused ? '▶ Resume' : '⏸ Pause'} Clipboard Capture`,
        click: () => {
          if (isPaused) {
            resumeMonitor();
            isPaused = false;
          } else {
            pauseMonitor('forever');
            isPaused = true;
          }
          tray.setContextMenu(buildMenu());
          updateTrayTitle();
        },
      },
      ...(!isPaused ? [
        {
          label: 'Pause for...',
          submenu: [
            {
              label: '15 minutes',
              click: () => {
                pauseMonitor('15min');
                isPaused = true;
                tray.setContextMenu(buildMenu());
                updateTrayTitle();
                // Auto-resume
                setTimeout(() => {
                  isPaused = false;
                  tray.setContextMenu(buildMenu());
                  updateTrayTitle();
                }, 15 * 60 * 1000);
              },
            },
            {
              label: '1 hour',
              click: () => {
                pauseMonitor('1hour');
                isPaused = true;
                tray.setContextMenu(buildMenu());
                updateTrayTitle();
                setTimeout(() => {
                  isPaused = false;
                  tray.setContextMenu(buildMenu());
                  updateTrayTitle();
                }, 60 * 60 * 1000);
              },
            },
            {
              label: 'Until tomorrow',
              click: () => {
                pauseMonitor('tomorrow');
                isPaused = true;
                tray.setContextMenu(buildMenu());
                updateTrayTitle();
              },
            },
          ],
        },
      ] : []),
      { type: 'separator' },
      {
        label: '🔍 Open Search  Ctrl+Shift+V',
        click: showOverlay,
      },
      {
        label: '📋 Open Copycat',
        click: showMain,
      },
      { type: 'separator' },
      {
        label: 'Quit Copycat',
        click: quit,
      },
    ]);
    return contextMenu;
  }

  function updateTrayTitle() {
    if (process.platform === 'darwin') {
      tray.setTitle(isPaused ? ' ⏸' : '');
    }
    tray.setToolTip(
      isPaused
        ? 'Copycat — Paused'
        : 'Copycat — Copy it once. Find it forever.'
    );
  }

  tray.setContextMenu(buildMenu());

  // Left click shows overlay
  tray.on('click', showOverlay);

  return tray;
}

module.exports = { setupTray };
