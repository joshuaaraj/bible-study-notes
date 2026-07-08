import type Database from 'better-sqlite3'
import { SCHEMA_SQL, SCHEMA_VERSION } from './schema'

export function runMigrations(db: Database.Database): void {
  const currentVersion = (db.pragma('user_version', { simple: true }) as number) || 0

  if (currentVersion < 1) {
    db.exec(SCHEMA_SQL)
    db.pragma(`user_version = ${SCHEMA_VERSION}`)
    return
  }

  if (currentVersion < 2) {
    // Fix: drop the old notes_au trigger that fired on every UPDATE (including
    // the internal updated_at change), then recreate it with a WHEN guard so it
    // only fires when title or content actually changes. Without the guard the
    // notes_updated_at trigger cascades into a second notes_au firing, causing
    // double FTS5 writes and SQLITE_CORRUPT_VTAB errors.
    db.exec(`
      DROP TRIGGER IF EXISTS notes_au;

      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes
      WHEN old.title != new.title OR old.content != new.content BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content)
          VALUES ('delete', old.id, old.title, old.content);
          INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
      END;

      INSERT INTO notes_fts(notes_fts) VALUES('rebuild');
    `)
    db.pragma(`user_version = 2`)
  }
}
