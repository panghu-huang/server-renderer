import { IRailingConfig, IRailingOptions } from '@railing/types'
import { createWebpackConfig } from '@railing/scripts'
import * as http from 'http'
import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import * as webpack from 'webpack'
import * as connect from 'connect'
import { loadRailingConfig } from '../config'
import DevServer from './dev-server'
import Railing from './base'

class RailingServer extends Railing {

  private devServer?: null | DevServer
  private readonly railingConfig: IRailingConfig
  private readonly internalMiddlewares: connect.Server

  constructor(options: IRailingOptions) {
    super(options)
    this.railingConfig = loadRailingConfig()
    this.internalMiddlewares = this.createMiddlewares()
  }

  public get middlewares() {
    return this.internalMiddlewares
  }

  public start() {
    if (this.options.dev) {
      this.devServer = new DevServer({
        railingConfig: this.railingConfig,
        middlewares: this.internalMiddlewares
      })

      this.devServer.start()
    } else {
      // createHttpServer()
    }
  }

  private createMiddlewares() {
    console.log('Creating server middlewares...')
    console.log('Creating webpack compiler...')
    const compiler = this.createWebpackCompiler()
    const devMiddleware = WebpackDevMiddleware(compiler, {
      writeToDisk: true
    })

    return connect()
      .use(this.handleRequest.bind(this))
      .use(devMiddleware)
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse, next: connect.NextFunction) {
    if (req.url === '/') {
      res.end('<html><div>content</div><script src="/app.js"></script></html>')
    } else {
      next()
    }
  }

  private createWebpackCompiler() {
    const clientWebpackConfig = createWebpackConfig(this.railingConfig, {
      isDev: true,
      isServer: false
    })
    if (this.railingConfig.ssr === false) {
      return webpack(clientWebpackConfig)
    }
    const serverWebpackConfig = createWebpackConfig(this.railingConfig, {
      isDev: true,
      isServer: true
    })
    return webpack([clientWebpackConfig, serverWebpackConfig])
  }

}

export default RailingServer