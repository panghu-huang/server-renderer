import * as React from 'react'
import { ParameterizedContext } from 'koa'
import { Location, History } from 'history'

export interface RouterStore {
  location: Location
}

export interface ErrorProps {
  error: any
}

export interface ContainerProps {
  routes: Route[]
  App: AppComponentType
  pageProps: object
  Error: React.ComponentType<ErrorProps>
  location: string
  error?: any
}

export interface RouterContainerProps {
  location: string
  children?: React.ReactNode
}

export interface LinkProps {
  to: string
  style?: React.CSSProperties
  className?: string
  activeClassName?: string
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

export interface Route {
  name: string
  path: string
  component: React.ComponentType<any>
}

export type AppComponentType = React.ComponentType<AppProps>

export interface GlobalAppData {
  pageProps: object
}

export type AppProps<T = {}> = T &{
  Component: React.ComponentType<any>
}

export interface RenderOptions {
  container: string
  routes: Route[]
  Error?: React.ComponentType<ErrorProps>
  App?: AppComponentType
}

export type Subscriber = (location: Location) => void

export interface Params {
  Component: React.ComponentType<any>
  url: string
  ctx?: ParameterizedContext
}

export const Link: React.FunctionComponent<LinkProps>

export class history {
  public static push(path: string, state?: any): void
  public static replace(path: string, state?: any): void
  public static go(n: number): void
  public static goBack(): void
  public static subscribe(subscriber: Subscriber): void
}

export const RouterContext: React.Context<RouterStore>

export function render(opts: RenderOptions): void

declare global {
  namespace React {
    interface ComponentClass {
      getInitialProps?: (...args: any[]) => any
    }
    interface FunctionComponent {
      getInitialProps?: (...args: any[]) => any
    }
  }

  interface Window {
    __APP_DATA__: string
  }
}
