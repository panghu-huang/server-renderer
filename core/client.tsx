import * as React from 'react'
import { hydrate } from 'react-dom'
import { RouterContext } from './RouterContext'
import { RenderOptions, GlobalAppData } from 'index.d'
import Router from './Router'
import DefaultError from './Error'
import Link from './Link'

export function render(opts: RenderOptions) {
  const AppContainer = opts.AppContainer || React.Fragment
  const routes = opts.routes
  const pathname = window.location.href
  const str = decodeURIComponent(window.__APP_DATA__)
  const appData = JSON.parse(str) as GlobalAppData
  const Error = opts.Error || DefaultError
  const app = (
    <Router
      location={pathname}
      routes={routes}
      history={opts.history}
      AppContainer={AppContainer}
      pageProps={appData.pageProps}
      error={appData.error ? <Error error={appData.error} /> : undefined}
    />
  )
  hydrate(app, document.querySelector(opts.container))
}

export { Router, Link, RouterContext }
export * from 'history'