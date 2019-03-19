import * as React from 'react'
import { hydrate } from 'react-dom'
import { Router, matchPath } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import Container from './Container'

import ServerRenderer = require('index')

export function render(opts: ServerRenderer.RenderOptions) {
  const AppContainer = opts.AppContainer || React.Fragment
  const routes = opts.routes
  const pathname = window.location.pathname
  const history = opts.history || createBrowserHistory()
  const matchedIndex = routes.findIndex(route => {
    return !!matchPath(pathname, route)
  })
  const str = decodeURIComponent(window.__APP_DATA__)
  const appData = JSON.parse(str) as ServerRenderer.GlobalAppData
  const app = (
    <Router history={history}>
      <Container 
        routes={routes}
        pageProps={appData.pageProps}
        matchedIndex={matchedIndex}
        AppContainer={AppContainer}
      />
    </Router>
  )
  hydrate(app, document.querySelector(opts.container))
}

export * from 'react-router-dom'
export * from 'history'