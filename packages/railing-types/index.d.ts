import { IRailingRendererPlugin } from './renderer-plugin'

export type Hooks = any

export type IRuntimeConfig = Record<string, any>

export interface IRailingPlugin {
  apply(railing: IRailingConfig): void
}

export interface IRailingHooks {
  htmlTemplate: Hooks
  htmlRendered: Hooks
}

export interface IRailingOptions {
  dev?: boolean
}

export interface IRailingStartOptions {
  port?: number
}

export class IRailing {
  constructor(options: IRailingOptions)
  public readonly hooks: IRailingHooks
  public readonly middlewares: any
  public start(options: IRailingStartOptions): void
}

export type IRailingConfigEntry = string | { client?: string, server?: string }

export interface IRailingConfig {
  ssr?: boolean
  entry?: IRailingConfigEntry
  outputDir?: string
  runtimeConfig?: IRuntimeConfig
  plugins?: IRailingPlugin[]
}

export interface IRailingConfigAPI {

}

export * from './renderer-plugin'