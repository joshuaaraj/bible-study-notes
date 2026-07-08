import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface AppConfig {
  dataFolder: string | null
  schemaVersion: number
}

const configPath = join(app.getPath('userData'), 'config.json')

function readConfig(): AppConfig {
  if (!existsSync(configPath)) {
    return { dataFolder: null, schemaVersion: 1 }
  }
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return { dataFolder: null, schemaVersion: 1 }
  }
}

function writeConfig(config: AppConfig): void {
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

export function isFirstLaunch(): boolean {
  return readConfig().dataFolder === null
}

export function getDataFolder(): string | null {
  return readConfig().dataFolder
}

export function setDataFolder(folderPath: string): void {
  const attachmentsDir = join(folderPath, 'attachments')
  if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })
  if (!existsSync(attachmentsDir)) mkdirSync(attachmentsDir, { recursive: true })

  const config = readConfig()
  config.dataFolder = folderPath
  writeConfig(config)
}
