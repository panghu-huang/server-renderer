import * as React from 'react'
import { hydrate } from 'react-dom'
import { Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import ServerRenderer = require('index')

export function render(opts: ServerRenderer.RenderOptions) {
  const history = createBrowserHistory()
  const AppContainer = opts.AppContainer || React.Fragment
  const routes = opts.routes
  const app = (
    <Router history={history}>
      <Switch>
        <AppContainer>
          {routes.map((route, index) => {
            return (
              <Route
                key={index}
                {...route}
              />
            )
          })}
        </AppContainer>
      </Switch>
    </Router>
  )
  hydrate(app, document.querySelector(opts.container))
}