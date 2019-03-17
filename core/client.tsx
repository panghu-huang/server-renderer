import * as React from 'react'
import { hydrate } from 'react-dom'
import { Route, Switch, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import ServerRenderer = require('index')

export function render(opts: ServerRenderer.RenderOptions) {
  const history = createBrowserHistory()
  const AppContainer = opts.AppContainer || React.Fragment
  const routes = opts.routes
  const app = (
    <Router history={history}>
      <AppContainer>
        <Switch>
          {routes.map((route, index) => {
            return (
              <Route key={index} {...route}/>
            )
          })}
        </Switch>
      </AppContainer>
    </Router>
  )
  hydrate(app, document.querySelector(opts.container))
}

export * from 'react-router-dom'