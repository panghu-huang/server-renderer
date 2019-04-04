# ServerRenderer - Router 测试版
library of server side render for React

## 安装
```bash
$ yarn add server-renderer@router react react-dom
$ yarn add typescript tslib @types/react .... -D
```

## 用法
> 目录结构
```
📦server-renderer-example
 ┣ 📂src
 ┃ ┣ 📂pages
 ┃ ┃ ┣ 📂Home
 ┃ ┃ ┃ ┣ 📜Home.scss
 ┃ ┃ ┃ ┗ 📜index.tsx
 ┃ ┃ ┣ 📜Other.tsx
 ┃ ┃ ┣ 📜Notfound.tsx
 ┃ ┃ ┗ 📜index.ts
 ┃ ┣ 📜App.tsx
 ┃ ┣ 📜index.html
 ┃ ┣ 📜index.tsx
 ┃ ┗ 📜routes.ts
 ┗ 📜package.json
```

> src/pages/Home/index.tsx
```tsx
import * as React from 'react'
import { Link } from 'server-renderer'
// CSS Modules
import classes from './Home.scss'

interface HomeProps {
  data: any
}

const Home: React.FunctionComponent<HomeProps> = (props) => {
  const handler = () => console.log('clicked')
  return (
    <div className={classes.container}>
      <p className={classes.content}>
        <Link to='/others'>to others page</Link>
      </p>
      <p onClick={handler}>{JSON.stringify(props.data)}</p>
    </div>
  )
}

Home.getInitialProps = async () => {
  try {
    const data = await fetch('https://api.com/xxx').then(res => res.json())
    return { data }
  } catch (error) {
    return { data: JSON.stringify(error) }
  }
}

export default Home
```

> src/routes.tsx
```ts
import * as React from 'react'
import { Route } from 'server-renderer'
import * as pages from './pages'

const routes: Route[] = [
  { 
    name: 'home',
    path: '/',
    component: pages.Home,
  },
  {
    name: 'others',
    path: '/others',
    component: pages.Other,
  },
  {
    path: '*',
    name: '404',
    component: pages.Notfound,
  },
]

export default routes
```

> src/App.tsx
```tsx
import * as React from 'react'
import { AppContainerProps, Params } from 'server-renderer'

interface AppProps extends AppContainerProps {
  data: any
}

class App extends React.Component<AppProps> {

  public static async getInitialProps({ url, Component }: Params) {
    if (Component.getInitialProps) {
      const data =  await Component.getInitialProps({ url })
      return { data }
    }
    return {
      data: {},
    }
  }

  public render() {
    const { Component, data } = this.props
    return (
      <Component 
        {...data}
      />
    )
  }

}

export default App
```

> src/index.tsx
```ts
import { render } from 'server-renderer'
import { Error } from 'path/to/your/components'
import routes from './routes'
import App from './App'

render({
  container: '.app-container',
  AppContainer: App,
  Error,
  routes,
})
```

> src/index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div class="app-container"></div>
</body>
</html>
```

## 自定义配置
```javascript
const merge = require('webpack-merge')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  webpack(config, { isServer, isDev }) {
    if (!isDev && !isServer) {
      return merge(config, {
        plugins: [
          new BundleAnalyzerPlugin()
        ]
      })
    }
    return config
  }
}
```

## package.json
```json
{
  "name": "server-renderer-example",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "dev": "server-renderer dev",
    "build": "server-renderer build",
    "start": "server-renderer start"
  },
  "dependencies": {
    "react": "^16.8.4",
    "react-dom": "^16.8.4",
    "server-renderer": "^0.2.6"
  },
  "devDependencies": {
    "@types/history": "^4.7.2",
    "@types/react": "^16.8.8",
    "@types/react-dom": "^16.8.2",
    "@types/react-router-dom": "^4.3.1",
    "tslib": "^1.9.3",
    "tslint": "^5.14.0",
    "tslint-config-prettier": "^1.18.0",
    "tslint-react": "^3.6.0",
    "typescript": "^3.3.3333"
  }
}

```
## 开发
```bash
$ yarn dev
```

## 生产环境构建
```bash
$ yarn build
$ yarn start
```
## Dockerfile

```dockerfile
FROM node
WORKDIR /path/to/workdir
COPY . /path/to/workdir
RUN yarn install
RUN yarn build
EXPOSE 3030
CMD yarn start
```