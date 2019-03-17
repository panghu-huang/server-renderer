import { RouteProps } from 'react-router-dom'

export type Route = RouteProps

export interface AppContainerProps {
  children: React.ReactNode
}

export interface RenderOptions {
  container: string
  routes: Route[]
  AppContainer?: React.ComponentType<AppContainerProps>
}