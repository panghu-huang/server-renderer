import * as React from 'react'
import { hydrate } from 'react-dom'
import { RouterContext } from './RouterContext'
import { history } from './history'
import { RenderOptions, GlobalAppData } from 'index.d'
import DefaultApp from './DefaultApp'
import Router from './Router'
import Container from './Container'
import DefaultError from './Error'
import Link from './Link'

export function render(opts: RenderOptions) {
  const App = opts.App || DefaultApp
  const routes = opts.routes
  const url = window.location.href
  const appData: GlobalAppData = JSON.parse(
    decodeURIComponent(window.__APP_DATA__)
  )
  const Error = opts.Error || DefaultError
  const app = (
    <Router location={url}>
      <Container
        location={url}
        routes={routes}
        App={App}
        Error={Error}
        pageProps={appData.pageProps}
      />
    </Router>
  )
  hydrate(app, document.querySelector(opts.container))
}

export { history, Link, RouterContext }
export * from 'history'