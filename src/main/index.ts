// Force native GTK dialog on Linux (XDG portal doesn't support openDirectory)
process.env['GTK_USE_PORTAL'] = '0'

import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerAllHandlers } from './ipc/register'
import { getDataFolder } from './config'
import { openDb } from './db'

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Bible Study Notes',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  registerAllHandlers()

  const dataFolder = getDataFolder()
  if (dataFolder) {
    try {
      openDb(dataFolder)
    } catch (e) {
      console.error('Failed to open database:', e)
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
