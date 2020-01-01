import * as React from 'react'
import * as types from 'src/types'

const App: React.FC<types.AppProps> = ({
  Component, ...otherProps
}) => {
  if (Component) {
    return <Component {...otherProps}/>
  }
  return null
}

App.getInitialProps = async (params: types.GetInitialPropsParams) => {
  const { Component } = params
  if (Component && Component.getInitialProps) {
    return await Component.getInitialProps(params)
  }
  return {}
}

export default App
