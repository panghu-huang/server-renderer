import* as React from 'react'
import { RouteProps, RouteComponentProps } from 'react-router-dom'
import { History } from 'history'

export * from 'react-router-dom'

export type AppContainerType = React.ComponentType<AppContainerProps>

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
  AppContainer?: AppContainerType
}

export function render(opts: RenderOptions): void

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
