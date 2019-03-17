import * as http from 'http'
import * as webpack from 'webpack'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import { genWebpackConfig } from './webpack-config'
import { getDevConfig } from './dev-config'
import chalk from 'chalk'
import './server-compiler'

const rootDirectory = process.cwd()
const devConfig = getDevConfig()
const clientDevConfig = genWebpackConfig({ 
  rootDirectory, isDev: true, isServer: false 
})
const clientCompiler = webpack(clientDevConfig)

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

app.listen(devConfig.webpackServerPort, () => {
  console.log(
    chalk.green(`Webpack 开发服务运行在 http://localhost:${devConfig.webpackServerPort}`)
  )
})

