import * as path from 'path'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { Configuration } from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getHashDigest, interpolateName } from 'loader-utils'
import { getDevConfig, DevConfiguration } from './dev-config'
import webpack = require('webpack');

export interface GenerateWebpackOpts {
  rootDirectory: string
  isDev?: boolean
  isServer?: boolean
}

export function genWebpackConfig(opts: GenerateWebpackOpts) {
  const { rootDirectory, isDev = false, isServer = false } = opts
  const devConfig = getDevConfig()
  const resolve = absolutePath => path.resolve(rootDirectory, absolutePath)

  const outputDirectory = getOutputDirectoty(devConfig, isDev, isServer)
  const plugins = getBundlePlugins(opts, devConfig)

  const config: Configuration = {
    stats: isDev ? 'errors-only' : 'normal',
    mode: isDev ? 'development' : 'production',
    target: isServer ? 'node' : 'web',
    entry: resolve('src/index.tsx'),
    output: {
      path: resolve(outputDirectory),
      publicPath: isServer 
      ? devConfig.serverPublicPath 
      : devConfig.clientPublicPath,
      filename: isServer 
        ? devConfig.serverChunkName 
        : devConfig.clientChunkName,
      libraryTarget: isServer ? 'commonjs2' : 'umd',
      pathinfo: false,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      alias: {
        'server-renderer': isServer 
          ? 'server-renderer/lib/server.js' 
          : 'server-renderer/lib/client.js'
      },
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
          },
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: getSassLoaders(isServer, isDev),
        }
      ],
    },
    plugins,
    optimization: (isDev || isServer)
      ? undefined
      : {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
            react: {
              name: 'commons',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/
            }
          }
        },
        minimize: !isDev && !isServer,
      },
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

function getBundlePlugins(
  { rootDirectory, isDev, isServer }: GenerateWebpackOpts,
  config: DevConfiguration
) {
  let plugins = []
  if (!isServer) {
    // 客户端
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        tsconfig: path.join(rootDirectory, 'tsconfig.json'),
        tslint: path.join(rootDirectory, 'tslint.json'),
      })
    )
    if (!isDev) {
      plugins = plugins.concat(
        [
          new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
          }),
          new BundleAnalyzerPlugin(),
          new webpack.optimize.ModuleConcatenationPlugin(),
          new webpack.optimize.AggressiveMergingPlugin(),
          new HtmlWebpackPlugin({
            template: config.htmlTemplatePath,
            filename: config.htmlFilename,
          })
        ]
      )
    }
  }
  return plugins
}

function getOutputDirectoty(config: DevConfiguration, isDev:boolean, isServer: boolean) {
  if (isDev || isServer) {
    return config.buildDirectory
  }
  return config.staticDirectory
}

function getSassLoaders(isServer: boolean, isDev: boolean) {
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
    if (isDev) {
      return [
        require.resolve('style-loader'),
        cssLoader,
        require.resolve('sass-loader'),
      ]
    }
    return [
      MiniCssExtractPlugin.loader,
      cssLoader,
      require.resolve('sass-loader')
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
  return className.replace('.module', '_')
}
