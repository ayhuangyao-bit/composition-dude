const { app, BrowserWindow, Menu, ipcMain, clipboard, nativeImage, protocol, net, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
protocol.registerSchemesAsPrivileged([{ scheme: 'composition', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
let mainWindow;
const origin = 'composition://studio';
const uiRoot = path.join(__dirname, 'ui');
app.setName('Composition Dude');
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 960, minWidth: 900, minHeight: 640,
    title: 'Composition Dude', backgroundColor: '#f4f6fa', show: false,
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadURL(`${origin}/index.html`);
  mainWindow.on('closed', () => { mainWindow = undefined; });
}
app.whenReady().then(() => {
  protocol.handle('composition', async request => {
    const url = new URL(request.url);
    if (url.host !== 'studio') return new Response('Not found', { status: 404 });
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Bad request', { status: 400 }); }
    const file = path.resolve(uiRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(uiRoot + path.sep)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  ipcMain.handle('composition:copy-png', (event, input) => {
    if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame?.url !== `${origin}/index.html`) throw new Error('Untrusted sender');
    if (!(input instanceof Uint8Array) || input.byteLength > 64 * 1024 * 1024) throw new Error('Invalid image');
    const data = Buffer.from(input);
    if (!data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Invalid PNG');
    const image = nativeImage.createFromBuffer(data);
    if (image.isEmpty()) throw new Error('PNG decoding failed');
    clipboard.writeImage(image);
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ label: 'Composition Dude', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' }, { type: 'separator' }, { role: 'quit' }] }] : []),
    { label: '编辑', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    { label: '视图', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: '窗口', submenu: [{ role: 'minimize' }, { role: 'close' }] },
  ]));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
