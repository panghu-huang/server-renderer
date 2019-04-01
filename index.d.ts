import * as React from 'react'
import { Location } from 'history'

export interface RouterStore {
  location: Location
}

export interface ErrorProps {
  error: any
}

export interface RouterProps {
  location: string
  routes: Route[]
  AppContainer: AppContainerType
  pageProps: object
}

export interface LinkProps {
  to: string
  style?: React.CSSProperties
  className?: string
  activeClassName?: string
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

export type RouteComponent = React.ComponentType<any>

export interface Route {
  name: string
  path: string
  component: RouteComponent
}

export type AppContainerType = React.ComponentType<AppContainerProps>

export interface GlobalAppData {
  pageProps: object
  error: any
}

export type AppContainerProps<T = {}> = T &{
  loading: boolean
  Component: React.ComponentType<any>
}

export interface RenderOptions {
  container: string
  routes: Route[]
  Error?: React.ComponentType<ErrorProps>
  AppContainer?: AppContainerType
}

export interface Params {
  Component: React.ComponentType<any>
  url: string
}

export const Link: React.FunctionComponent<LinkProps>

export class Router extends React.Component<RouterProps> {
  public static push(path: string, state?: any): void
  public static replace(path: string, state?: any): void
  public static go(n: number): void
  public static goBack(): void
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
