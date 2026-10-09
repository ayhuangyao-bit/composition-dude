const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('compositionDude', {
  version: '1.0.0',
  copyPng: bytes => ipcRenderer.invoke('composition:copy-png', bytes),
});
