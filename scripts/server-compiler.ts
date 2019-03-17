import * as webpack from 'webpack'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import { fork } from 'child_process'
import { join } from 'path'
import { unlink } from 'fs'
import { genWebpackConfig } from './webpack-config'
import chalk from 'chalk'

const appDirectory = process.cwd()
const serverDevConfig = genWebpackConfig({ 
  rootDirectory: appDirectory, isDev: true, isServer: true, 
})
const serverCompiler = webpack(serverDevConfig)
const serverDevMiddleware = WebpackDevMiddleware(serverCompiler, {
  publicPath: serverDevConfig.output.publicPath,
  writeToDisk: true,
  logLevel: 'warn',
})

let lastChunkName: string
let childProcess

serverCompiler.hooks.done.tap('server-compile-done', (stats: webpack.Stats) => {
  if (childProcess) {
    childProcess.kill()
    console.log(
      chalk.green('正在重启开发服务')
    )
  }
  const assets = stats.toJson().assetsByChunkName
  const chunkName = join(serverDevConfig.output.path, assets.main)
  // @ts-ignore
  childProcess = fork(chunkName, {}, { stdio: "inherit" })
  lastChunkName && unlink(lastChunkName, () => void 0)
  lastChunkName = chunkName
})