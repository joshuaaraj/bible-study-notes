export {}

declare global {
  interface Window {
    api: {
      config: {
        isFirstLaunch(): Promise<boolean>
        getDataFolder(): Promise<string | null>
        openFolderPicker(): Promise<string | null>
        setDataFolder(path: string): Promise<void>
      }
      bible: {
        getBooks(): Promise<unknown[]>
        getChapter(bookId: number, chapterNum: number): Promise<unknown[]>
      }
      notes: {
        getForScope(scope: unknown): Promise<unknown[]>
        getById(id: number): Promise<unknown>
        create(input: unknown): Promise<unknown>
        update(id: number, updates: unknown): Promise<unknown>
        delete(id: number): Promise<void>
        search(query: string, limit?: number): Promise<unknown[]>
        getRecent(limit?: number): Promise<unknown[]>
        getVerseNotesForChapter(bookId: number, chapterNum: number): Promise<unknown[]>
      }
      attachments: {
        pickFile(options?: unknown): Promise<string | null>
        add(noteId: number, sourcePath: string): Promise<unknown>
        getForNote(noteId: number): Promise<unknown[]>
        delete(id: number): Promise<void>
        openFile(filePath: string): Promise<void>
      }
      export: {
        noteToPdf(noteId: number): Promise<void>
      }
    }
  }
}
