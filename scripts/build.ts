import * as webpack from 'webpack'
import * as fs from 'fs'
import { join } from 'path'
import { genWebpackConfig } from './webpack-config'
import { getConfig } from './config'
import chalk from 'chalk'

runCompiler()

async function runCompiler() {
  const rootDirectory = process.cwd()
  const config = getConfig()
  const clientConfig = genWebpackConfig({ 
    isDev: false, isServer: false, rootDirectory, 
  })
  const serverConfig = genWebpackConfig({ 
    isDev: false, isServer: true, rootDirectory, 
  })
  rmdir(config.buildDirectory)
  rmdir(config.staticDirectory)
  console.log(
    chalk.green('打包服务端资源文件...')
  )
  await compiler(serverConfig)
  console.log(
    chalk.green('打包客户端资源文件...')
  )
  await compiler(clientConfig)
  console.log(
    chalk.green('资源打包完成!')
  )
}

function compiler(config: webpack.Configuration) {
  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) reject(err)
      const { warnings, errors } = stats.toJson() as { warnings: string[], errors: string[] }
      if (warnings.length) {
        warnings.forEach(warning => {
          console.log(
            chalk.yellowBright(warning)
          )
        })
      }
      if (errors.length) {
        errors.forEach(error => {
          console.log(
            chalk.red(error)
          )
        })
        process.exit(1)
      }
      resolve()
    })
  })
}

function rmdir(directory: string) {
  if (fs.existsSync(directory)) {
    const files = fs.readdirSync(directory)
    if (files.length) {
      files.forEach(filename => {
        const filePath = join(directory, filename)
        const stats = fs.statSync(filePath)
        if (stats.isDirectory()) {
          rmdir(filePath)
        } else {
          fs.unlinkSync(filePath)
        }
      })
    }
    fs.rmdirSync(directory)
  }
}