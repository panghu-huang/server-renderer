import * as types from 'src/types'
import { ComponentType } from 'react'
import { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { pathToRegexp } from 'path-to-regexp'

export function findMatchedRoute(url: string, routes: types.Route[] = []) {
  // 通配符
  const wildcard = '(.*)'
  const { pathname } = parseUrl(url)
  const matched = routes
    .map(route => {
      if (route.path === '*') {
        return {
          ...route,
          path: wildcard,
        }
      }
      return route
    })
    .find(route => {
      return pathToRegexp(route.path).test(pathname + '')
    })

  return matched
}

export async function callGetInitialProps(
  App: types.AppComponentType,
  Component: ComponentType<any> | null,
  url: string,
  req?: IncomingMessage,
  res?: ServerResponse,
) {
  if (App.getInitialProps) {
    const params: types.GetInitialPropsParams = {
      Component,
      url,
      req,
      res,
    }
    return await App.getInitialProps(params)
  }
  return {}
}