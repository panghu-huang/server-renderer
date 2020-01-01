import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { ChildProcess, fork } from 'child_process'
import { deleteDir, copyDir } from './utils'
import { createWebpackConfig } from '../config/webpack-config'
import { getConfig } from '../config/config'

process.env.NODE_ENV = 'development'

const config = getConfig()

let childProcess: ChildProcess | null = null
let chunkPath: string = ''
let buildTime: number = 0
let hasError = false

function createChildProcess() {
  childProcess = fork(chunkPath, [], {stdio: 'inherit'})
  childProcess.on('error', (err: Error) => {
    console.error(err.message)
    process.exit(1)
  })
  childProcess.on('close', () => {
    config.cleanConsoleOnRebuild && console.clear()
    if (childProcess?.killed && !hasError) {
      createChildProcess()
    }
  })
  console.log(
    chalk.green(`Compiled successfully! Done in ${(buildTime / 1000).toFixed(2)}s`)
  )
}

function runCompile(configs: webpack.Configuration[]) {
  const compiler = webpack(configs) as webpack.MultiCompiler
  compiler.hooks.watchRun.tap('ssr-watch-run', () => {
    config.cleanConsoleOnRebuild && console.clear()
    console.log(
      chalk.green(`Compiling...`)
    )
  })
  compiler.watch(
    {ignored: /node_modules/},
    (err: Error, stats: any) => {
      if (err) {
        hasError = true
        childProcess?.kill(1)
        throw err
      }
      const [serverStats] = (stats as webpack.compilation.MultiStats).stats
      const {errors, warnings, outputPath, assetsByChunkName, time} = serverStats.toJson()

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
        console.log(
          chalk.redBright('Compiled with errors')
        )
        errors.forEach(error => {
          console.log(
            chalk.redBright(error)
          )
        })
        hasError = true
        childProcess?.kill(1)
        process.exit(1)
      }

      hasError = false

      // [app.js, app.js.map] or app.js
      const assets = assetsByChunkName?.app
      if (!assets || outputPath && path.basename(outputPath) === 'client') {
        return
      }
      chunkPath = path.join(outputPath as string, Array.isArray(assets) ? assets[0] : assets)
      buildTime = time as number
      if (childProcess) {
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
