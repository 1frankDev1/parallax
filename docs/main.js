const { app, BrowserWindow, dialog, shell, ipcMain } = require('electron');

const path = require('path');
const { autoUpdater } = require('electron-updater');
const { execFile } = require('child_process');
const fs = require('fs');
app.commandLine.appendSwitch("enable-media-stream");
app.commandLine.appendSwitch('enable-speech-dispatcher');
app.commandLine.appendSwitch('enable-features', 'SpeechRecognitionOnDevice');


let mainWindow = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      media: true,
    }
  });
    mainWindow = win;

  //  Tu pantalla principal
  win.loadFile(path.join(__dirname, 'index.html'));

  //  Intercepta "window.open" (por ejemplo, enlaces con target="_blank")
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url); // abre en Chrome/navegador predeterminado
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  //  Intercepta también clics o redirecciones internas
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}


// ---- Auto-updater config ----
autoUpdater.autoDownload = true; // descargar automáticamente
autoUpdater.autoInstallOnAppQuit = false; // no esperar al quit para instalar

// eventos del autoUpdater -> reenviamos al renderer
autoUpdater.on('update-available', (info) => {
  console.log('update-available', info);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update_available', info);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  // progressObj: { bytesPerSecond, percent, total, transferred }
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update_download_progress', {
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total,
      bytesPerSecond: progressObj.bytesPerSecond
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('update-downloaded', info);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update_downloaded', info);
  }
});

// Si ocurre un error
autoUpdater.on('error', (err) => {
  console.error('autoUpdater error', err ? err.toString() : 'Desconocido');
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update_error', err ? err.toString() : 'Error desconocido');
  }
});
// IPC desde renderer (preload)
ipcMain.on('check_for_updates', (ev) => {
  console.log('Renderer pidió check_for_updates');
  autoUpdater.checkForUpdates();
});

ipcMain.on('install_update_now', (ev) => {
  console.log('Renderer pidió instalar ahora');
  // quitAndInstall reinicia la app e instala la update
  autoUpdater.quitAndInstall(true, true);
});


// 🔹 macOS: volver a abrir si no hay ventanas
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// 🔹 Cerrar la app completamente (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(() => {
  createWindow();

  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 500);
});


// Escuchar las solicitudes del frontend
ipcMain.on('abrir-programa', (event, nombreApp) => {
  console.log(`Intentando abrir: ${nombreApp}`);
  abrirPrograma(nombreApp);
});

// Función que busca y ejecuta el programa
function abrirPrograma(nombre) {
  const rutas = {
    '3cx': [
      'C:\\Program Files\\3CXPhone\\3CXPhone.exe',
      'C:\\Program Files (x86)\\3CXPhone\\3CXPhone.exe',
      'C:\\Program Files\\3CX\\Bin\\3CXWin8Phone.exe',
      'C:\\Program Files (x86)\\3CX\\Bin\\3CXWin8Phone.exe'
    ],
    'word': [
      'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE',
      'C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE'
    ],
    'excel': [
      'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
      'C:\\Program Files (x86)\\Microsoft Office\\Office16\\EXCEL.EXE'
    ]
  };

  const posibles = rutas[nombre.toLowerCase()];
  if (!posibles) {
    console.error('❌ No hay rutas configuradas para:', nombre);
    dialog.showErrorBox('No encontrado', `No hay rutas definidas para la aplicación "${nombre}".`);
    return;
  }

  let encontrado = null;
  for (const ruta of posibles) {
    if (fs.existsSync(ruta)) {
      encontrado = ruta;
      break;
    }
  }

  if (encontrado) {
    console.log('✅ Ejecutando:', encontrado);
    execFile(encontrado, (err) => {
      if (err) console.error('Error al abrir:', err);
    });
  } else {
    console.error(`⚠️ No se encontró "${nombre}" en ninguna ruta`);
    dialog.showErrorBox('No encontrado', `No se encontró la aplicación "${nombre}" en esta PC.`);
  }
}