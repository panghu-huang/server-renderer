import { join } from 'path'

const DEFAULT_WEBPACK_SERVER_PORT = 8080
const DEFAULT_DEV_SERVER_PORT = 3030

const DEFAULT_CLIENT_PUBLIC_PATH = '/static/'
const DEFAULT_SERVER_PUBLIC_PATH = '/'

export interface DevConfiguration {
  webpackServerPort: number
  devServerPort: number
  clientPublicPath: string
  serverPublicPath: string
  clientChunkName: string
  serverChunkName: string
  htmlPath: string
}

const rootDirectory = process.cwd()

export function getDevConfig(): DevConfiguration {
  return {
    clientChunkName: 'client.js',
    serverChunkName: 'server.js',
    webpackServerPort: DEFAULT_WEBPACK_SERVER_PORT,
    devServerPort: DEFAULT_DEV_SERVER_PORT,
    clientPublicPath: DEFAULT_CLIENT_PUBLIC_PATH,
    serverPublicPath: DEFAULT_SERVER_PUBLIC_PATH,
    htmlPath: join(rootDirectory, 'src/index.html'),
  }
}