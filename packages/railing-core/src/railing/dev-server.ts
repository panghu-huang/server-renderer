import type { IRailingConfig } from '@railing/types'
import type { Server as Middlewares } from 'connect'
import * as http from 'http'

export interface IDevServerOptions {
  railingConfig: IRailingConfig
  middlewares: Middlewares
}

class DevServer {
  private railingConfig: IRailingConfig
  private middlewares: Middlewares

  constructor(options: IDevServerOptions) {
    this.railingConfig = options.railingConfig
    this.middlewares = options.middlewares

    console.log(this.railingConfig);
  }

  public start() {
    console.log('Starting develop server...')
    const server = http.createServer(this.middlewares)

    server.listen(3000)
  }

}

export default DevServer