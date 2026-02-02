const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../dist/front-boutique/browser/favicon.ico'),
  });

  // Load the Angular app
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../dist/front-boutique/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Hide the menu bar
  win.setMenuBarVisibility(false);

  // Open the DevTools.
  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
