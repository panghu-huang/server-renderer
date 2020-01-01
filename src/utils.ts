import * as types from 'src/types'
import { ComponentType } from 'react'
import { parse as parseUrl } from 'url'
import { pathToRegexp } from 'path-to-regexp'

export function findMatchedRoute(url: string, routes: types.Route[] = []) {
  const { pathname } = parseUrl(url)
  const matched = routes.find(route => {
    return pathToRegexp(route.path).test(pathname + '')
  })

  return matched
}

export async function callGetInitialProps(
  App: types.AppComponentType,
  Component: ComponentType<any> | undefined,
  url: string,
) {
  if (App.getInitialProps) {
    return await App.getInitialProps({ Component, url })
  }
  return {}
}