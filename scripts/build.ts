import webpack from 'webpack'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import FileSizeReporter from 'react-dev-utils/FileSizeReporter'
import { createWebpackConfig } from '../config/webpack-config'
import { getConfig } from '../config/config'
import { copyDir, deleteDir, logError, logSuccess } from './utils'

process.env.NODE_ENV = 'production'

const config = getConfig()

async function runCompile(webpackConfig: webpack.Configuration, isClient = false) {
  return new Promise(((resolve, reject) => {
    webpack(webpackConfig).run(((err, stats) => {
      if (err) {
        logError(err.message + '\n')
        reject()
        return
      }
      const { warnings, errors } = stats.toJson()
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
        reject()
        return
      }
      if (isClient) {
        logSuccess('File sizes after gzip:\n')
        FileSizeReporter.printFileSizesAfterBuild(
          stats,
          {
            root: path.join(config.distDir, 'client'),
            sizes: {},
          },
          path.join(config.distDir, 'client'),
          300,
        )
        console.log('\n')
      }
      resolve()
    }))
  }))
}

async function build() {
  try {
    logSuccess('Start compile...')
    const clientConfig = createWebpackConfig(false)
    const serverConfig = createWebpackConfig(true)

    // clear output directory and copy static files
    const serverOutput = serverConfig.output?.path as string
    const clientOutput = clientConfig.output?.path as string
    deleteDir(config.distDir)

    // create output directory
    fs.mkdirSync(config.distDir)
    const publicDir = path.join(config.rootDir, 'public')
    copyDir(publicDir, serverOutput)
    copyDir(publicDir, clientOutput)

    logSuccess('Start to build server bundle...')
    await runCompile(serverConfig)
    logSuccess('Start to build client bundle...')
    await runCompile(clientConfig, true)

    logSuccess('Compiled successfully.')
  } catch (error) {
    if (error) {
      logError(error)
    }
    process.exit(1)
  }
}

build()
