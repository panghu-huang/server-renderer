import { join } from 'path'

const DEFAULT_WEBPACK_SERVER_PORT = 8080
const DEFAULT_DEV_SERVER_PORT = 3030

const DEFAULT_CLIENT_PUBLIC_PATH = '/static/'
const DEFAULT_SERVER_PUBLIC_PATH = '/'

export interface Configuration {
  webpackServerPort: number
  serverPort: number
  clientPublicPath: string
  serverPublicPath: string
  clientChunkName: string
  serverChunkName: string
  htmlTemplatePath: string
  buildDirectory: string
  staticDirectory: string
  htmlFilename: string
  htmlPath: string
}

const rootDirectory = process.cwd()

export function getConfig(): Configuration {
  const htmlFilename = 'client.html'
  const staticDirectory = 'static'
  return {
    clientChunkName: 'app.js',
    serverChunkName: 'server.js',
    webpackServerPort: DEFAULT_WEBPACK_SERVER_PORT,
    serverPort: DEFAULT_DEV_SERVER_PORT,
    clientPublicPath: DEFAULT_CLIENT_PUBLIC_PATH,
    serverPublicPath: DEFAULT_SERVER_PUBLIC_PATH,
    htmlTemplatePath: join(rootDirectory, 'src/index.html'),
    htmlFilename,
    htmlPath: join(rootDirectory, staticDirectory, 'client.html'),
    buildDirectory: 'build',
    staticDirectory,
  }
}