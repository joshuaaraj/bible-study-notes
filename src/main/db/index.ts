import Database from 'better-sqlite3'
import { join } from 'path'
import { runMigrations } from './migrations'

let db: Database.Database | null = null

export function openDb(dataFolder: string): Database.Database {
  if (db) return db

  const dbPath = join(dataFolder, 'bible-notes.db')
  db = new Database(dbPath)
  runMigrations(db)
  return db
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call openDb() first.')
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
