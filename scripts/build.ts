import webpack from 'webpack'
import chalk from 'chalk'
import path from 'path'
import FileSizeReporter from 'react-dev-utils/FileSizeReporter'
import { createWebpackConfig } from '../config/webpack-config'
import { getConfig } from '../config/config'
import { copyDir, deleteDir } from './utils'
import fs from "fs";

process.env.NODE_ENV = 'production'

const config = getConfig()

async function runCompile(webpackConfig: webpack.Configuration, isClient = false) {
  return new Promise(((resolve, reject) => {
    webpack(webpackConfig).run(((err, stats) => {
      if (err) {
        console.log(
          chalk.redBright(err.message)
        )
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
        console.log(
          chalk.redBright('Compiled with errors')
        )
        errors.forEach(error => {
          console.log(
            chalk.redBright(error)
          )
        })
        reject()
        return
      }
      if (isClient) {
        console.log(
          chalk.green('File sizes after gzip:\n')
        )
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
    console.log(
      chalk.green('Start compile...')
    )
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

    console.log(
      chalk.green('Start to build server bundle...')
    )
    await runCompile(serverConfig)
    console.log(
      chalk.green('Start to build client bundle...')
    )
    await runCompile(clientConfig, true)

    console.log(
      chalk.green('Compiled successfully.')
    )
  } catch (error) {
    if (error) {
      console.log(
        chalk.red(error)
      )
    }
    process.exit(1)
  }
}

build()
