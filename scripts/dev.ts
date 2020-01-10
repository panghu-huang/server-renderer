import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { ChildProcess, fork } from 'child_process'
import { deleteDir, copyDir, logError, logSuccess } from './utils'
import { createWebpackConfig } from '../config/webpack-config'
import { getConfig } from '../config/config'

process.env.NODE_ENV = 'development'

const config = getConfig()

let childProcess: ChildProcess | null = null
let chunkPath: string = ''
let buildTime: number = 0
let hasError = false
let isChildProcessExited = true

function createChildProcess() {
  childProcess = fork(chunkPath, [], {stdio: 'inherit'})
  isChildProcessExited = false
  
  childProcess.on('error', (err: Error) => {
    logError(err.message)
    process.exit(1)
  })

  childProcess.on('close', () => {
    !hasError && config.cleanConsoleOnRebuild && console.clear()

    if (childProcess?.killed && !hasError) {
      createChildProcess()
    }
  })

  childProcess.on('exit', () => {
    isChildProcessExited = true
  })

  !hasError && logSuccess(`Compiled successfully! Done in ${(buildTime / 1000).toFixed(2)}s`)
}

function runCompile(configs: webpack.Configuration[]) {
  const compiler = webpack(configs) as webpack.MultiCompiler

  compiler.hooks.watchRun.tap('server-renderer', compiler => {
    const isClient = path.basename(compiler.outputPath) === 'client'

    if (isClient) {
      return
    }
    config.cleanConsoleOnRebuild && console.clear()
    logSuccess('compiling...')
  })

  compiler.watch({ignored: /node_modules/}, (err: Error, stats: any) => {
      if (err) {
        logError(err.message)
        hasError = true
        childProcess?.kill(1)
        return
      }
      const [serverStats] = (stats as webpack.compilation.MultiStats).stats
      const {errors, warnings, outputPath, assetsByChunkName, time} = serverStats.toJson()

      // [app.js, app.js.map] or app.js
      const assets = assetsByChunkName?.app
      if (!assets || outputPath && path.basename(outputPath) === 'client') {
        return
      }

      if (warnings.length) {
        console.log(
          chalk.yellowBright('Compiled with warnings')
        )
        warnings.forEach(warning => {
          console.log(
            chalk.yellowBright(warning)
          )
        })
      }
      if (errors.length) {
        logError('Compiled with errors')
        errors.forEach(logError)
        hasError = true
      } else {
        hasError = false
      }
      
      chunkPath = path.join(outputPath as string, Array.isArray(assets) ? assets[0] : assets)
      buildTime = time as number
      
      if (childProcess && !isChildProcessExited) {
        childProcess.kill()
      } else {
        createChildProcess()
      }
    }
  )
}

function build() {
  const serverDevConfig = createWebpackConfig(true)
  const clientDevConfig = createWebpackConfig(false)

  // clear output directory and copy static files.
  const serverOutput = serverDevConfig.output?.path as string
  const clientOutput = clientDevConfig.output?.path as string
  deleteDir(config.distDir)

  // create output directory
  fs.mkdirSync(config.distDir)
  const publicDir = path.join(config.rootDir, 'public')
  copyDir(publicDir, serverOutput)
  copyDir(publicDir, clientOutput)

  runCompile([serverDevConfig, clientDevConfig])
}

build()
