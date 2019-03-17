import * as path from 'path'
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { Configuration } from 'webpack'
import { getHashDigest, interpolateName } from 'loader-utils'
import { getDevConfig } from './dev-config'

export interface GenerateWebpackOpts {
  rootDirectory: string
  isDev?: boolean
  isServer?: boolean
}

export function genWebpackConfig(opts: GenerateWebpackOpts) {
  const { rootDirectory, isDev = false, isServer = false } = opts
  const devConfig = getDevConfig()
  const resolve = absolutePath => path.resolve(rootDirectory, absolutePath)

  const plugins = []
  if (!isServer) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.join(rootDirectory, 'tsconfig.json')
      })
    )
  }
  const config: Configuration = {
    stats: isDev ? 'errors-only' : 'normal',
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
      pathinfo: false,
    },
    cache: false,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: isServer,
          },
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: getSassLoaders(isServer),
        }
      ],
    },
    plugins,
  }
  
  if (!isServer) {
    config.node = {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    }
  }

  return config
}

function getSassLoaders(isServer: boolean) {
  const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
      importLoaders: 1,
      modules: true,
      getLocalIdent,
    },
  }
  if (isServer) {
    return [
      require.resolve('isomorphic-style-loader'),
      cssLoader,
      require.resolve('sass-loader'),
    ]
  } else {
    return [
      require.resolve('style-loader'),
      cssLoader,
      require.resolve('sass-loader'),
    ]
  }
}

function getLocalIdent(
  context,
  localIdentName,
  localName,
  options
) {
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|scss|sass)$/
  )
    ? '[folder]'
    : '[name]'
  const hash = getHashDigest(
    context.resourcePath + localName,
    'md5',
    'base64',
    5
  )
  const className = interpolateName(
    context,
    fileNameOrFolder + '_' + localName + '__' + hash,
    options
  )
  return className.replace('.module_', '_')
}
