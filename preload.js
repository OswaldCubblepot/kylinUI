const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runPython: () => ipcRenderer.send('runPython'),
  onFromPython: (callback) => ipcRenderer.on('fromPython', (event, schemeNumber) => callback(schemeNumber)),
  serverTypeSelected: (serverType) => ipcRenderer.send('server-type-selected', serverType), // 新增的接口
  
  // 新增的接口用于暗夜模式
  toggleDarkMode: () => ipcRenderer.send('toggle-dark-mode'),
  onDarkModeStatus: (callback) => ipcRenderer.on('dark-mode-status', (event, isDarkMode) => callback(isDarkMode))
});

