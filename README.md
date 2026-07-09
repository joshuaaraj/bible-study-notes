# Bible Study Notes

A personal Bible study note-taking app for Windows and Linux. Browse all 66 books of the Bible (KJV), write rich-text notes scoped to a verse, verse range, chapter, or entire book, and search everything with full-text search.

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

## Features

- Browse all 66 Bible books → chapters → verses (KJV text)
- Rich text editor: headings, lists, checklists, tables, blockquotes, code blocks, images, links
- Notes scoped to a verse, verse range, chapter, or entire book
- Verse text is automatically copied into new notes as a blockquote
- Full-text search across all your notes
- PDF attachments
- Export notes to PDF
- All data stored locally in a folder you choose

## Data

Your notes are stored in a SQLite database inside the folder you pick on first launch. To back up your notes, just copy that folder.
