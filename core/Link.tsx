import * as React from 'react'
import * as _path2Regexp from 'path-to-regexp'
import { RouterContext } from './RouterContext'
import { history } from './history'
import { LinkProps } from 'index.d'

const path2Regexp = _path2Regexp

const Link: React.FunctionComponent<LinkProps> = ({
  className, activeClassName, to, onClick, ...restProps
}) => {
  const { location } = React.useContext(RouterContext)
  const matched = path2Regexp(location.pathname).test(to)
  const cls = className + matched ? activeClassName : ''
  const handleClick = (evt: React.MouseEvent) => {
    if (onClick) {
      onClick(evt)
    }
    if (!evt.isDefaultPrevented()) {
      evt.preventDefault()
      history.push(to)
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

Link.defaultProps = {
  className: '',
  activeClassName: '',
}

export default Link