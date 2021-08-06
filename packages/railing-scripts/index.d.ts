import type { Configuration as WebpackConfiguration } from 'webpack'
import type { IRailingConfig } from '@railing/types'
import type { ICreateWebpackConfigOptions } from './src/types'

export function createWebpackConfig(
  railingConfig: IRailingConfig,
  options: ICreateWebpackConfigOptions
): WebpackConfiguration