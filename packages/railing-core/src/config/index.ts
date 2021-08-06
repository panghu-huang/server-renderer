import { RAILING_CONFIG } from '../constants'
import { IRailingConfig } from '@railing/types'
import * as fs from 'fs'

const validExtensions = ['.js']

export function loadRailingConfig() {
  const rootDir = process.cwd()

  let railingConfig: IRailingConfig = {}

  const configPath = rootDir + RAILING_CONFIG + validExtensions[0]
  if (fs.existsSync(configPath)) {
    railingConfig = require(configPath)
  }

  return railingConfig
}