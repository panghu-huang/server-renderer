import { RouteProps } from 'react-router-dom'

declare namespace ServerRenderer {

  export type Route = RouteProps

  export interface AppContainerProps {
    children: React.ReactNode
  }

  export interface RenderOptions {
    container: string
    routes: Route[]
    AppContainer?: React.ComponentType<AppContainerProps>
  }

  export function render(opts: RenderOptions): void;

}

export = ServerRenderer