import * as React from 'react'
import { StaticRouterContext } from 'react-router'
import { Route, Switch, RouteProps } from 'react-router-dom'

import ServerRenderer = require('index')

export interface ContainerProps {
  routes: RouteProps[]
  matchedIndex: number
  pageProps: object
  AppContainer: ServerRenderer.AppContainerType
}

const emptyProps = {}

const Container: React.FunctionComponent<ContainerProps> = ({
  routes, matchedIndex, pageProps, AppContainer
}) => {
  return (
    <AppContainer {...pageProps}>
      <Switch>
        {routes.map(({ component, ...routeProps }, index) => {
          const Page = component
          const initialProps = index === matchedIndex
            ? pageProps
            : emptyProps
          return (
            <Route
              key={index}
              {...routeProps}
              render={props => (
                <Page {...props} {...initialProps} />
              )}
            />
          )
        })}
      </Switch>
    </AppContainer>
  )
}

export default Container