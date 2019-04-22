import * as webpack from 'webpack'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import { genWebpackConfig } from './webpack-config'
import { fork } from 'child_process'
import { join } from 'path'
import chalk from 'chalk'

const rootDirectory = process.cwd()
const serverDevConfig = genWebpackConfig({ 
  rootDirectory, isDev: true, isServer: true, 
})
const serverCompiler = webpack(serverDevConfig)
const serverDevMiddleware = WebpackDevMiddleware(serverCompiler, {
  publicPath: serverDevConfig.output.publicPath,
  writeToDisk: true,
  logLevel: 'silent',
})

let childProcess

serverCompiler.hooks.done.tap('server-compile-done', (stats: webpack.Stats) => {
  if (childProcess) {
    childProcess.kill()
    console.clear()
    console.log(
      chalk.green('正在重启开发服务...')
    )
  }
  const assets = stats.toJson().assetsByChunkName
  const chunkPath = join(serverDevConfig.output.path, assets.main)
  // @ts-ignore
  childProcess = fork(chunkPath, {}, { stdio: 'inherit' })
})