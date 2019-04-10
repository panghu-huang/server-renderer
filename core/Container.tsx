import * as React from 'react'
import { parse } from 'url'
import { Location } from 'history'
import { router } from './router'
import { ContainerProps, RouteComponent, Route } from 'index.d'
import path2Regexp from 'path-to-regexp'

interface RouteState {
  component: RouteComponent | null
  pageProps: object
}

class Container extends React.PureComponent<ContainerProps, RouteState> {

  constructor(props: ContainerProps) {
    super(props)
    const { routes, pageProps, location } = props
    const matchedRoute = this.getMatchedRoute(routes, parse(location).pathname)
    const component = matchedRoute && matchedRoute.component
    this.state = {
      component,
      pageProps,
    }
    router.subscribe(this.handleHistoryChange)
  }


  public render() {
    const { App, Error } = this.props
    const { component, pageProps } = this.state
    if (!component) {
      return (
        <Error error='Page not found' />
      )
    }
    return (
      <App
        Component={component}
        {...pageProps}
      />
    )
  }

  private fetchInitialProps = async (matchedRoute: Route | null, url: string) => {
    if (!matchedRoute) {
      return null
    }
    const { App } = this.props
    if (App && App.getInitialProps) {
      const initialProps = await App.getInitialProps({
        url,
        Component: matchedRoute.component,
      })
      this.setState({ pageProps: initialProps })
    }
  }

  private handleHistoryChange = (location: Location) => {
    const { routes } = this.props
    const matchedRoute = this.getMatchedRoute(routes, location.pathname)
    this.setState({
      component: matchedRoute ? matchedRoute.component : null,
      pageProps: {},
    })
    this.fetchInitialProps(matchedRoute, window.location.toString())
  }

  private getMatchedRoute(routes: Route[], pathname: string): Route | null {
    const matched = routes.find(route => {
      return path2Regexp(route.path, [], { strict: true }).test(pathname)
    })
    return matched || routes.find(route => route.path === '*' || !route.path)
  }

}

export default Container