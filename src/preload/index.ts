import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  config: {
    isFirstLaunch: (): Promise<boolean> => ipcRenderer.invoke('config:isFirstLaunch'),
    getDataFolder: (): Promise<string | null> => ipcRenderer.invoke('config:getDataFolder'),
    openFolderPicker: (): Promise<string | null> => ipcRenderer.invoke('config:openFolderPicker'),
    setDataFolder: (path: string): Promise<void> => ipcRenderer.invoke('config:setDataFolder', path)
  },
  bible: {
    getBooks: (): Promise<unknown[]> => ipcRenderer.invoke('bible:getBooks'),
    getChapter: (bookId: number, chapterNum: number): Promise<unknown[]> =>
      ipcRenderer.invoke('bible:getChapter', bookId, chapterNum)
  },
  notes: {
    getForScope: (scope: unknown): Promise<unknown[]> =>
      ipcRenderer.invoke('notes:getForScope', scope),
    getById: (id: number): Promise<unknown> => ipcRenderer.invoke('notes:getById', id),
    create: (input: unknown): Promise<unknown> => ipcRenderer.invoke('notes:create', input),
    update: (id: number, updates: unknown): Promise<unknown> =>
      ipcRenderer.invoke('notes:update', id, updates),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('notes:delete', id),
    search: (query: string, limit?: number): Promise<unknown[]> =>
      ipcRenderer.invoke('notes:search', query, limit),
    getRecent: (limit?: number): Promise<unknown[]> => ipcRenderer.invoke('notes:getRecent', limit),
    getVerseNotesForChapter: (bookId: number, chapterNum: number): Promise<unknown[]> =>
      ipcRenderer.invoke('notes:getVerseNotesForChapter', bookId, chapterNum)
  },
  attachments: {
    pickFile: (options?: unknown): Promise<string | null> =>
      ipcRenderer.invoke('attachments:pickFile', options),
    add: (noteId: number, sourcePath: string): Promise<unknown> =>
      ipcRenderer.invoke('attachments:add', noteId, sourcePath),
    getForNote: (noteId: number): Promise<unknown[]> =>
      ipcRenderer.invoke('attachments:getForNote', noteId),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('attachments:delete', id),
    openFile: (filePath: string): Promise<void> => ipcRenderer.invoke('attachments:openFile', filePath)
  },
  export: {
    noteToPdf: (noteId: number): Promise<void> => ipcRenderer.invoke('export:noteToPdf', noteId)
  }
})
