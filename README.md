# ServerRenderer@Alpha

### DEMO
[https://github.com/wokeyi/games-club](https://github.com/wokeyi/games-club)

### 安装
```bash
$ yarn add react react-dom server-renderer@alpha
```

### 使用
```javascript
import { render } from 'server-renderer'
import App from './App'
import routes from './routes'

render({
  // React 渲染节点
  container: '#root',
  // 可选
  App,
  // 可选，路由配置
  routes,
})
```

* HTML 入口默认为 `${rootDir}/src/index.html`

* 客户端和服务端入口默认为 `${rootDir}/src/index.tsx`

* 路由配置

```javascript
export interface Route {
  path: string
  component: ComponentType<any>
}

const routes: Route[] = []
```

* `Component.getInitialProps` 获取数据

```javascript
export interface GetInitialPropsParams {
  // 路由匹配到的组件
  Component: ComponentType<any> | null
  // 访问路径
  url: string
  res?: ServerResponse
  req?: IncomingMessage
}
```
调用 App.getInitialProps 时会默认传入 `GetInitialPropsParams` 结构的数据

* 路由

路由主要依靠 [history](https://github.com/ReactTraining/history) 建立

```javascript
// history.push('/path')
export const history: History

// 返回当前路由对应的 Location 对象
export function useLocation(): Location<any>

// /path/:user/:id => { user: xxx, id: xxx }
export function useParams<T extends object>(): T
```

* CSS

文件名以大写开头默认使用 CSS Module

```javascript
{
  test: /\.s?css$/,
  oneOf: [
    {
      test: (modulePath: string) => {
        const basename = path.basename(modulePath)
        // 大写开头的就当做 css module
        return /^[A-Z]/.test(basename)
      },
      use: getStyleLoaders(isServer, true, config),
    },
    {
      use: getStyleLoaders(isServer, false, config),
    }
  ],
}
```

* 自定义配置

路径：`${rootDir}/ssr.config.js`

可提供配置项
```javascript
export interface Config {
  // 默认 process.env.NODE_ENV === 'development'
  isDev: boolean
  // 服务监听端口
  port: number
  // HTML 入口，默认 `${rootDir}/src/index.html`
  htmlTemplatePath: string
  // 打包输出目录
  distDir: string
  // 服务端入口（自定义服务端）
  serverEntry: string
  // 默认为 /public，静态文件默认加这个识别
  publicPath: string
  // 打包后输出的 HTML 文件路径
  builtHTMLPath: string
  // 重新编译是否清空控制台
  cleanConsoleOnRebuild: boolean
  // 是否对服务端直出的 HTML 做转译
  decodeEntities: boolean
  // sass 数据（node-sass options 中的 data）
  sassData: string | null
  // 自定义 Webpack 配置
  configureWebpack?: webpack.Configuration 
    | ((webpackConfig: webpack.Configuration, isServer: boolean, config: Config) => webpack.Configuration)
}
```

* renderToString

```javascript
export function renderToString(req: IncomingMessage, res: ServerResponse, url: string, options: RenderOptions): Promise<string>
```
提供一个 renderToString 方法，可以更方便的自定义服务端的内容，如：
```javascript
import express from 'express'
import path from 'path'
import { renderToString } from 'server-renderer'
import App from './App'

const app = express()
const router = express.Router()

router.get('*', async (req, res) => {
  const html = await renderToString(req, res, req.url, {
    container: '#root',
    App,
  })

  res.end(html)
})

app.use(router)

app.listen(3000)
```

* HTML 模板变量

默认注入 `NODE_ENV`、`PORT`、`PUBLIC_URL(webpack.output.publicPath)` 和 APP_XXX 等自定义的变量

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>%APP_TITLE%</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```