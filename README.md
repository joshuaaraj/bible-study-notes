# Bible Study Notes

A personal, offline Bible study app for Windows and Linux. Read the full Bible, write rich-text notes tied to specific verses or passages, reference verses inline while writing, and search everything instantly — all stored locally in a folder you control.

---

## Features

### Bible Reader
- Browse all 66 books of the Bible (KJV) — Old and New Testament
- Navigate by book → chapter → verse
- Verse indicator dots show which verses already have notes attached

### Note Taking
- **Scoped notes** — attach a note to a single verse, a verse range (e.g. Gen 1:1–5), a chapter, a chapter range (e.g. 1:10–2:3), or an entire book
- **Auto-populate** — when you open a new note, the selected verses are automatically quoted as a blockquote so you can write directly beneath them
- **Rich text editor** — headings, bold/italic, bullet and numbered lists, checklists, blockquotes, tables, inline code, code blocks, images, and links
- **Verse references** — type `@` or `#` anywhere in a note to search and insert an inline verse chip (e.g. `Jn 3:16`); hover to see the verse text

### Search & Organisation
- Full-text search across all your notes with highlighted excerpts
- Recently edited notes shown on the browser home screen
- Scope label on every note card (e.g. "Genesis 1:1–3", "Romans 8")

### Attachments & Export
- Attach PDF files to notes — they appear as clickable cards inside the editor and open in your system viewer
- Embed images directly in note content
- Export any note to PDF

### Data & Privacy
- Everything stored locally — no account, no cloud, no telemetry
- You choose the folder on first launch; your notes live there as a SQLite database
- Back up by copying the folder

---

## Download & Install

Go to the [Releases](https://github.com/joshuaaraj/bible-study-notes/releases/latest) page and download the file for your platform.

### Windows

1. Download `Bible Study Notes Setup 1.0.x.exe`
2. Run the installer
3. If Windows SmartScreen warns you ("Windows protected your PC"), click **More info** → **Run anyway** — this is expected for unsigned apps
4. Launch **Bible Study Notes** from the Start Menu
5. On first launch, choose a folder where your notes will be stored

### Linux

**AppImage** (works on most distros, no install needed):

1. Download `Bible Study Notes-1.0.x.AppImage`
2. Make it executable:
   ```bash
   chmod +x "Bible Study Notes-1.0.x.AppImage"
   ```
3. Run it:
   ```bash
   ./"Bible Study Notes-1.0.x.AppImage"
   ```
4. On first launch, choose a folder where your notes will be stored

**Debian/Ubuntu (.deb)**:

1. Download `bible-study-notes_1.0.x_amd64.deb`
2. Install it:
   ```bash
   sudo dpkg -i bible-study-notes_1.0.x_amd64.deb
   ```
3. Launch **Bible Study Notes** from your application menu

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save current note |
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `@` or `#` | Insert verse reference |

---

## Data

Notes are stored in a SQLite database inside the folder you pick on first launch. To back up, copy that folder. To move to a new machine, copy the folder and point the app at it on first launch.
