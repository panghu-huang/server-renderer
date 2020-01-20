import { FunctionComponent } from 'react'
import { IncomingMessage, ServerResponse } from 'http'
import { History, Location } from 'history'
import { RenderOptions, LinkProps } from './src/types'

export function render(options: RenderOptions): void

export const Link: FunctionComponent<LinkProps>

export const history: History

export function useLocation(): Location<any>

export function useParams<T extends object>(): T

export function renderToString(req: IncomingMessage, res: ServerResponse, url: string, options: RenderOptions): Promise<string>

export * from './src/types'