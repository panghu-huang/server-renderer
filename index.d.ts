import * as React from 'react'
import { Location } from 'history'

export interface RouterStore {
  location: Location
}

export interface RouterProps {
  location: string
  routes: Route[]
  AppContainer: AppContainerType
  pageProps: object
  error?: any
}

export interface LinkProps {
  to: string
  style?: React.CSSProperties
  className?: string
  activeClassName?: string
  onClick?: React.MouseEventHandler
  children?: React.ReactNode
}

export type RouteComponent = React.ComponentType<RouteComponentProps> | React.FunctionComponent<RouteComponentProps> | React.SFC<RouteComponentProps>

export interface Route {
  name: string
  path: string
  component: RouteComponent
}

export interface FetchData<T = {}> {
  loading?: boolean
  data?: T | null
  error?: Error | string | null
}

export type RouteComponentProps = FetchData & { [propName: string]: any }

export type AppContainerType = React.ComponentType<AppContainerProps>

export interface GlobalAppData {
  pageProps: object
}

export interface GetInitialPropsParams {
  pathname: string
  route: Route
}

export interface AppContainerProps {
  children: React.ReactNode
}

export interface RenderOptions {
  container: string
  routes: Route[]
  AppContainer?: AppContainerType
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
      getInitialProps?: (pathname: string) => any
    }
    interface FunctionComponent {
      getInitialProps?: (pathname: string) => any
    }
  }

  interface Window {
    __APP_DATA__: string
  }
}
