export const SCHEMA_VERSION = 3

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notes (
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

CREATE TABLE IF NOT EXISTS attachments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id       INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    original_name TEXT    NOT NULL,
    stored_name   TEXT    NOT NULL,
    file_path     TEXT    NOT NULL,
    mime_type     TEXT    NOT NULL,
    size_bytes    INTEGER NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title,
    content,
    content='notes',
    content_rowid='id',
    tokenize='unicode61 remove_diacritics 1'
);

CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content)
    VALUES ('delete', old.id, old.title, old.content);
END;

-- Only sync FTS when title or content actually change, not when updated_at changes.
-- Without this guard the notes_updated_at trigger causes a second UPDATE which
-- fires notes_au again, producing a double FTS5 write that corrupts the index.
CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes
WHEN old.title != new.title OR old.content != new.content BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content)
    VALUES ('delete', old.id, old.title, old.content);
    INSERT INTO notes_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS notes_updated_at AFTER UPDATE ON notes
WHEN old.updated_at = new.updated_at BEGIN
    UPDATE notes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = new.id;
END;

CREATE INDEX IF NOT EXISTS idx_notes_book         ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_book_chapter ON notes(book_id, chapter_num);
CREATE INDEX IF NOT EXISTS idx_notes_scope
    ON notes(scope_type, book_id, chapter_num, verse_start, verse_end);
CREATE INDEX IF NOT EXISTS idx_notes_updated      ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_note   ON attachments(note_id);
`
