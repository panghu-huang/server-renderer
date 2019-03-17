import { RouteProps } from 'react-router-dom'
import { History } from 'history'

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