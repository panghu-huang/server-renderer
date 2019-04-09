import * as http from 'http'
import * as webpack from 'webpack'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import { genWebpackConfig } from './webpack-config'
import { getConfig } from './config'
import chalk from 'chalk'
import './server-compiler'

const rootDirectory = process.cwd()
const clientDevConfig = genWebpackConfig({ 
  rootDirectory, isDev: true, isServer: false,
})
const clientCompiler = webpack(clientDevConfig)

const clientDevMiddleware = WebpackDevMiddleware(clientCompiler, {
  publicPath: clientDevConfig.output.publicPath,
  writeToDisk: false,
  logLevel: 'silent',
})

const app = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  clientDevMiddleware(req, res, () => {
    res.end()
  })
})

app.listen(getConfig().webpackServerPort, () => {
  console.clear()
  console.log(
    chalk.green(`正在启动开发服务...`)
  )
})

