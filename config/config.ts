import webpack from 'webpack'
import path from 'path'
import fs from 'fs'

export interface Config {
  isDev: boolean
  port: number
  htmlTemplatePath: string
  distDir: string
  rootDir: string
  serverEntry: string
  publicPath: string
  builtHTMLPath: string
  cleanConsoleOnRebuild: boolean
  decodeEntities: boolean
  sassData: string | null
  htmlAttributes: {
    script?: object
    style?: object
  }
  configureWebpack?: webpack.Configuration 
    | ((webpackConfig: webpack.Configuration, isServer: boolean, config: Config) => webpack.Configuration)
}

export const getConfig = (): Config => {
  const rootDir = process.cwd()

  const defaultConfig: Config = {
    rootDir,
    isDev: process.env.NODE_ENV === 'development',
    port: 3000,
    htmlTemplatePath: path.join(rootDir, 'src/index.html'),
    distDir: path.join(rootDir, 'dist'),
    builtHTMLPath: path.join(rootDir, 'dist/client/index.html'),
    serverEntry: path.resolve(rootDir, 'src/index.tsx'),
    publicPath: '/public/',
    cleanConsoleOnRebuild: true,
    decodeEntities: false,
    sassData: null,
    htmlAttributes: {},
  }

  const customConfigPath = path.resolve(defaultConfig.rootDir, 'ssr.config.js')
  if (fs.existsSync(customConfigPath)) {
    const customConfig: Config = require(customConfigPath)
    return {
      ...defaultConfig,
      ...customConfig,
      rootDir,
    }
  }

  return defaultConfig
}