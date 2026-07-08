import { registerConfigHandlers } from './config'
import { registerBibleHandlers } from './bible'
import { registerNotesHandlers } from './notes'
import { registerAttachmentHandlers } from './attachments'
import { registerExportHandlers } from './export'

export function registerAllHandlers(): void {
  registerConfigHandlers()
  registerBibleHandlers()
  registerNotesHandlers()
  registerAttachmentHandlers()
  registerExportHandlers()
}
