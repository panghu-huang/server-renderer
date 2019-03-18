import * as webpack from 'webpack'
import { existsSync, rmdirSync } from 'fs'
import { join } from 'path'
import { genWebpackConfig } from './webpack-config'
import { getDevConfig } from './dev-config'
import chalk from 'chalk'

const rootDirectory = process.cwd()
const devConfig = getDevConfig()
const clientConfig = genWebpackConfig({ isDev: false, isServer: false, rootDirectory, })
const serverConfig = genWebpackConfig({ isDev: false, isServer: true, rootDirectory, })

async function compile() {
  // const buildDirectory = join(rootDirectory, devConfig.buildDirectory)
  // const staticDirecory = join(rootDirectory, devConfig.staticDirectory)
  // if (existsSync(buildDirectory)) {
  //   rmdirSync(buildDirectory)
  // }
  // if (existsSync(staticDirecory)) {
  //   rmdirSync(staticDirecory)
  // }
  console.log(
    chalk.green('打包服务端资源文件...')
  )
  await runCompile(serverConfig)
  console.log(
    chalk.green('打包客户端资源文件...')
  )
  await runCompile(clientConfig)
}

compile()

function runCompile(config: webpack.Configuration) {
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
      }
      resolve()
    })
  })
}