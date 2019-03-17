import * as path from 'path'
import { Configuration } from 'webpack'
import { getDevConfig } from './dev-config'

export interface GenerateWebpackOpts {
  rootDirectory: string
  isDev?: boolean
  isServer?: boolean
}

export function genWebpackConfig(opts: GenerateWebpackOpts) {
  const { rootDirectory, isDev = false, isServer = false } = opts
  const devConfig = getDevConfig()
  const resolve = (absolutePath: string) => path.resolve(rootDirectory, absolutePath)

  const config: Configuration = {
    mode: isDev ? 'development' : 'production',
    target: isServer ? 'node' : 'web',
    entry: resolve(`src/index.tsx`),
    output: {
      path: resolve('build'),
      publicPath: isServer 
      ? devConfig.serverPublicPath 
      : devConfig.clientPublicPath,
      filename: isServer 
        ? devConfig.serverChunkName 
        : devConfig.clientChunkName,
      libraryTarget: isServer ? 'commonjs2' : undefined,
    },
    cache: false,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          loader: require.resolve('ts-loader'),
        }
      ]
    },
  }

  return config
}