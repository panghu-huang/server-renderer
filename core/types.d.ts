import { RouteProps } from 'react-router-dom'

export type Route = RouteProps

export interface ServerOptions {
  container: string
}

export interface AppContainerProps {
  children: React.ReactNode
}

export interface RenderOptions {
  container: string
  routes: Route[]
  AppContainer?: React.ComponentType<AppContainerProps>
}