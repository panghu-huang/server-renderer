import * as React from 'react'
import { RouterContext } from './RouterContext'
import { LinkProps } from 'index.d'
import path2Regexp from 'path-to-regexp'
import Router from './Router'

const Link: React.FunctionComponent<LinkProps> = ({
  to, className = '', activeClassName = '', onClick, ...restProps
}) => {
  const { location } = React.useContext(RouterContext)
  const matched = path2Regexp(location.pathname).test(to)
  const cls = className + matched ? activeClassName : ''
  const handleClick = (evt: React.MouseEvent) => {
    if (onClick) {
      return onClick(evt)
    }
    if (!evt.isDefaultPrevented()) {
      evt.preventDefault()
      Router.push(to)
    }
  }
  return (
    <a 
      href={to} 
      className={cls}
      onClick={handleClick} 
      {...restProps}
    />
  )
}

export default Link