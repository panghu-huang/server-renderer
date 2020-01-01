import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { fork } from 'child_process'
import { getConfig } from '../config/config'

const config = getConfig()

const chunkPath = path.join(config.distDir, 'server/app.js')

function start() {
  if (fs.existsSync(chunkPath)) {
    const childProcess = fork(chunkPath, [], {stdio: 'inherit'})

    childProcess.on('close', (code: number) => {
      if (code !== 0) {
        // error happened!
        start()
      }
    })
  } else {
    console.log(
      chalk.red(`"${chunkPath}" is not exist`)
    )
  }
}

start()
