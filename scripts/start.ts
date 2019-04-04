import { existsSync } from 'fs'
import { join } from 'path'
import { getConfig } from './config'
import chalk from 'chalk'

const config = getConfig()
const rootDirectory = process.cwd()
const serverChunk = join(
  config.buildDirName, config.serverChunkName
)
const serverChunkPath = join(
  rootDirectory, serverChunk
)

if (existsSync(serverChunkPath)) {
  require(serverChunkPath)
} else {
  console.log(
    chalk.red(`未找到 ${serverChunk}，请先执行 'yarn build'`)
  )
  process.exit(1)
}