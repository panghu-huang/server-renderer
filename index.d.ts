import* as React from 'react'
import { RouteProps } from 'react-router-dom'
import { History } from 'history'

declare global {
  namespace React {
    interface ComponentClass {
      getInitialProps?: (url: string) => object
    }
    interface FunctionComponent {
      getInitialProps?: (url: string) => object
    }
  }
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