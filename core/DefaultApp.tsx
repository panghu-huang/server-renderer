import * as React from 'react'
import { AppProps, Params } from 'index.d'

class DefaultApp extends React.Component<AppProps<{ data: any }>> {

  public static async getInitialProps(params: Params) {
    if (params.Component && params.Component.getInitialProps) {
      const data = await params.Component.getInitialProps(params)
      return {
        data,
      }
    }
    return {
      data: {},
    }
  }

  public render() {
    const { Component, data } = this.props
    return (
      <Component {...data}/>
    )
  }

}

export default DefaultApp