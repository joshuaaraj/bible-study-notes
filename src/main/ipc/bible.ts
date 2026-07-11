import { ipcMain } from 'electron'
import { getBooks, getChapter, searchReference } from '../bible/loader'

export function registerBibleHandlers(): void {
  ipcMain.handle('bible:getBooks', () => getBooks())

  ipcMain.handle('bible:getChapter', (_event, bookId: number, chapterNum: number) =>
    getChapter(bookId, chapterNum)
  )

  ipcMain.handle('bible:searchReference', (_event, query: string) =>
    searchReference(query)
  )
}
