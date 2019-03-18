import* as React from 'react'
import { RouteProps } from 'react-router-dom'
import { History } from 'history'

declare global {
  namespace React {
    interface ComponentClass {
      getInitialProps?: (...args: any[]) => object
    }
    interface FunctionComponent {
      getInitialProps?: (...args: any[]) => object
    }
  }

  interface Window {
    __APP_DATA__: string
  }
}

export interface GlobalAppData {
  pageProps: object
}

export interface GetInitialPropsParams {
  pathname: string
  route: RouteProps
}

export interface AppContainerProps {
  children: React.ReactNode
}

export interface RenderOptions {
  container: string
  routes: RouteProps[]
  AppContainer?: React.ComponentType<AppContainerProps>
}

export function render(opts: RenderOptions): void

export * from 'react-router-dom'