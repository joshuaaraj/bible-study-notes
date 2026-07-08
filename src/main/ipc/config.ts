import { ipcMain, dialog, BrowserWindow } from 'electron'
import { isFirstLaunch, getDataFolder, setDataFolder } from '../config'
import { openDb } from '../db'

export function registerConfigHandlers(): void {
  ipcMain.handle('config:isFirstLaunch', () => isFirstLaunch())

  ipcMain.handle('config:getDataFolder', () => getDataFolder())

  ipcMain.handle('config:openFolderPicker', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win ?? BrowserWindow.getAllWindows()[0], {
      properties: ['openDirectory'],
      title: 'Choose a folder to store your Bible notes',
      buttonLabel: 'Select Folder'
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('config:setDataFolder', (_event, folderPath: string) => {
    setDataFolder(folderPath)
    openDb(folderPath)
  })
}
