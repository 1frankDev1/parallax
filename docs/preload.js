// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  // --- Lanzar programas ---
  abrirPrograma: (nombre) => ipcRenderer.send("abrir-programa", nombre),

  // --- AutoUpdater: comandos ---
  checkForUpdates: () => ipcRenderer.send("check_for_updates"),
  installUpdateNow: () => ipcRenderer.send("install_update_now"),

  // --- AutoUpdater: eventos desde main ---
  onUpdateAvailable: (cb) =>
    ipcRenderer.on("update_available", (event, info) => cb(info)),

  onUpdateProgress: (cb) =>
    ipcRenderer.on("update_download_progress", (event, progress) => cb(progress)),

  onUpdateDownloaded: (cb) =>
    ipcRenderer.on("update_downloaded", (event, info) => cb(info)),

  onUpdateError: (cb) =>
    ipcRenderer.on("update_error", (event, err) => cb(err)),

  // --- Generic send/receive (útil para más cosas) ---
  send: (channel, data) => ipcRenderer.send(channel, data),

  receive: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args))
});
