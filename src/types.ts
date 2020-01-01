import { ComponentType, default as React } from 'react'

export interface RenderOptions {
  container: string
  routes?: Route[]
  App?: AppComponentType
}

export interface Route {
  path: string
  component: ComponentType<any>
}

export interface AppProps {
  Component?: ComponentType<any>
  [propName: string]: any
}

export interface RouterProps {
  url: string
  routes: Route[]
  component: ComponentType<any> | null
  pageProps: any
  App: AppComponentType
}

export interface GetInitialPropsParams {
  Component: ComponentType<any> | null
  url: string
}

export interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  to: string
}

export type AppComponentType = ComponentType<AppProps>

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
    __APP_DATA__: {
      pageProps: object
    }
  }
}
