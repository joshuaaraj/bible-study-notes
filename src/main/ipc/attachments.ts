import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { copyFileSync, unlinkSync, statSync } from 'fs'
import { join, basename } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../db'
import { getDataFolder } from '../config'

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return map[ext] ?? 'application/octet-stream'
}

export function registerAttachmentHandlers(): void {
  ipcMain.handle('attachments:pickFile', async (event, options?: { filters?: Electron.FileFilter[] }) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile'],
      filters: options?.filters ?? [{ name: 'All Files', extensions: ['*'] }]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('attachments:add', (_event, noteId: number, sourcePath: string) => {
    const db = getDb()
    const dataFolder = getDataFolder()!
    const originalName = basename(sourcePath)
    const storedName = `${uuidv4()}-${originalName}`
    const destPath = join(dataFolder, 'attachments', storedName)

    copyFileSync(sourcePath, destPath)
    const stats = statSync(destPath)

    const stmt = db.prepare(`
      INSERT INTO attachments (note_id, original_name, stored_name, file_path, mime_type, size_bytes)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(noteId, originalName, storedName, destPath, getMimeType(originalName), stats.size)
    return db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid)
  })

  ipcMain.handle('attachments:getForNote', (_event, noteId: number) => {
    return getDb().prepare('SELECT * FROM attachments WHERE note_id = ? ORDER BY created_at').all(noteId)
  })

  ipcMain.handle('attachments:delete', (_event, id: number) => {
    const db = getDb()
    const attachment = db.prepare('SELECT file_path FROM attachments WHERE id = ?').get(id) as { file_path: string } | undefined
    if (attachment) {
      try { unlinkSync(attachment.file_path) } catch { /* file already gone */ }
      db.prepare('DELETE FROM attachments WHERE id = ?').run(id)
    }
  })

  ipcMain.handle('attachments:openFile', (_event, filePath: string) => {
    shell.openPath(filePath)
  })
}
