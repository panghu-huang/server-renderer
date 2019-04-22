import * as webpack from 'webpack'
import { join } from 'path'
import { GenerateWebpackOpts } from './webpack-config'

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
  buildDirName: string
  staticDirName: string
  buildDirectory: string
  staticDirectory: string
  htmlFilename: string
  htmlPath: string
  srcDirectory: string
  customConfigFile: string
}

type CustomMerge = (
  config: webpack.Configuration, 
  opts: GenerateWebpackOpts
) => webpack.Configuration

export interface CustomConfiguration {
  webpack?: webpack.Configuration | CustomMerge
}

const rootDirectory = process.cwd()

export function getConfig(): Configuration {
  const htmlFilename = 'client.html'
  const staticDirName = 'static'
  const buildDirName = 'build'
  const srcDirectory = join(rootDirectory, 'src')
  return {
    htmlFilename,
    buildDirName,
    staticDirName,
    clientChunkName: 'app.js',
    serverChunkName: 'server.js',
    webpackServerPort: DEFAULT_WEBPACK_SERVER_PORT,
    serverPort: DEFAULT_DEV_SERVER_PORT,
    clientPublicPath: DEFAULT_CLIENT_PUBLIC_PATH,
    serverPublicPath: DEFAULT_SERVER_PUBLIC_PATH,
    htmlTemplatePath: join(srcDirectory, 'index.html'),
    htmlPath: join(rootDirectory, staticDirName, 'client.html'),
    buildDirectory: join(rootDirectory, buildDirName),
    staticDirectory: join(rootDirectory, staticDirName),
    srcDirectory,
    customConfigFile: join(rootDirectory, 'server-renderer.config.js'),
  }
}