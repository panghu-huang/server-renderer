import * as http from 'http'
import * as webpack from 'webpack'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import { URL } from 'url'
import { join } from 'path'
import { unlink } from 'fs'
import { genWebpackConfig } from './webpack-config'
import chalk from 'chalk'

const DEV_SERVER_PORT = 8080
const APP_SERVER_PORT = 3030
const htmlPath = join(process.cwd(), 'src/index.html')

const serverDevConfig = genWebpackConfig({ isDev: true, isServer: true })
const clientDevConfig = genWebpackConfig({ isDev: true, isServer: false })
const outputPath = serverDevConfig.output.path
const clientChunkName = join(
  clientDevConfig.output.publicPath, 
  clientDevConfig.output.filename
)
const clientChunkPath = new URL(
  clientChunkName, 
  `http://localhost:${DEV_SERVER_PORT}`
)

let server: any
let lastChunkName: string

const serverCompiler = webpack(serverDevConfig)
const clientCompiler = webpack(clientDevConfig)

WebpackDevMiddleware(serverCompiler, {
  publicPath: serverDevConfig.output.publicPath,
  writeToDisk: true,
  logLevel: 'warn',
})

serverCompiler.hooks.done.tap('server-compiler-done', startServer)

const clientDevMiddleware = WebpackDevMiddleware(clientCompiler, {
  publicPath: clientDevConfig.output.publicPath,
  writeToDisk: false,
  logLevel: 'warn',
})

const app = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  clientDevMiddleware(req, res, () => {
    console.log('next')
    res.end()
  })
})

app.listen(DEV_SERVER_PORT, () => {
  console.log(
    chalk.green(`Webpack 开发服务运行在 http://localhost:${DEV_SERVER_PORT}`)
  )
})

async function startServer(stats: webpack.Stats) {
  const assets = stats.toJson().assetsByChunkName
  if (server) {
    delete require.cache[
      require.resolve(lastChunkName)
    ]
    await server.close()
    console.log(
      chalk.green('正在重启开发服务器...')
    )
  }
  const chunkName = join(outputPath, assets.main)
  const Server = require(chunkName).default 
  server = new Server({
    container: '.app-container',
    htmlPath,
    clientChunkPath,
    port: APP_SERVER_PORT,
  })
  server.start()
  console.log(
    chalk.green(`启动成功，http://localhost:${APP_SERVER_PORT}`)
  )
  lastChunkName && unlink(lastChunkName, () => void 0)
  lastChunkName = chunkName
  setTimeout(() => {
    console.clear()
    console.log(
      chalk.green(`启动成功，http://localhost:${APP_SERVER_PORT}`)
    )
  }, 1000)
}
