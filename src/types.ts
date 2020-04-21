import { ComponentType, HTMLAttributes } from 'react'
import { IncomingMessage, ServerResponse } from 'http'

export interface RenderOptions {
  container: string
  routes?: Route[]
  App?: AppComponentType
}

export interface Route {
  path: string | '*'
  component: ComponentType<any>
}

export interface AppProps<PageProps = any> {
  Component: ComponentType<any> | null
  pageProps: PageProps
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
  res?: ServerResponse
  req?: IncomingMessage
}

export interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
  to: string
}

export type AppComponentType = ComponentType<AppProps>

type GetInitialPropsFnResult<Props> = Partial<Props extends AppProps ? Props['pageProps'] : Props>

type GetInitialPropsFn<P> = (...args: any[]) => 
  GetInitialPropsFnResult<P> | Promise<GetInitialPropsFnResult<P>>

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string
      PUBLIC_URL: string
    }
  }

  namespace React {
    interface ComponentClass<P = {}> {
      getInitialProps?: GetInitialPropsFn<P>
    }
    interface FunctionComponent<P = {}> {
      getInitialProps?: GetInitialPropsFn<P>
    }
  }

  interface Window {
    __APP_DATA__: {
      pageProps: object
    }
  }
}