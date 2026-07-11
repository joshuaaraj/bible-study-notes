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

  if (currentVersion < 3) {
    // Rebuild the notes table to: add chapter_end column and expand the
    // scope_type CHECK constraint to include 'chapter_range'.
    // SQLite does not support ALTER COLUMN, so we use the 12-step procedure.
    db.pragma('foreign_keys = OFF')
    db.exec(`
      CREATE TABLE notes_new (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_type   TEXT    NOT NULL CHECK(scope_type IN ('verse','verse_range','chapter','chapter_range','book')),
        book_id      INTEGER NOT NULL,
        chapter_num  INTEGER,
        chapter_end  INTEGER,
        verse_start  INTEGER,
        verse_end    INTEGER,
        title        TEXT    NOT NULL DEFAULT '',
        content      TEXT    NOT NULL DEFAULT '{}',
        created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      );

      INSERT INTO notes_new
        (id, scope_type, book_id, chapter_num, chapter_end, verse_start, verse_end, title, content, created_at, updated_at)
      SELECT id, scope_type, book_id, chapter_num, NULL, verse_start, verse_end, title, content, created_at, updated_at
      FROM notes;

      DROP TABLE notes;
      ALTER TABLE notes_new RENAME TO notes;

      CREATE INDEX IF NOT EXISTS idx_notes_book         ON notes(book_id);
      CREATE INDEX IF NOT EXISTS idx_notes_book_chapter ON notes(book_id, chapter_num);
      CREATE INDEX IF NOT EXISTS idx_notes_scope        ON notes(scope_type, book_id, chapter_num, verse_start, verse_end);
      CREATE INDEX IF NOT EXISTS idx_notes_updated      ON notes(updated_at DESC);

      DROP TRIGGER IF EXISTS notes_ai;
      CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
          INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
      END;

      DROP TRIGGER IF EXISTS notes_ad;
      CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content)
          VALUES ('delete', old.id, old.title, old.content);
      END;

      DROP TRIGGER IF EXISTS notes_au;
      CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes
      WHEN old.title != new.title OR old.content != new.content BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content)
          VALUES ('delete', old.id, old.title, old.content);
          INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
      END;

      DROP TRIGGER IF EXISTS notes_updated_at;
      CREATE TRIGGER IF NOT EXISTS notes_updated_at AFTER UPDATE ON notes
      WHEN old.updated_at = new.updated_at BEGIN
          UPDATE notes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = new.id;
      END;
    `)
    db.pragma('foreign_keys = ON')
    db.pragma('user_version = 3')
  }
}
