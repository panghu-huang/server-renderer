import rollup from 'rollup'
import path from 'path'
import typescript from '@rollup/plugin-typescript'

export function createRollupConfig(isServer: boolean) {
  // 打包后会加一层 lib/
  const resolvePath = (p: string) => path.resolve(__dirname, '../..', p)
  const inputOptions: rollup.RollupOptions = {
    input: isServer ? resolvePath('src/server.ts') : resolvePath('src/client.tsx'),
    plugins: [
      typescript({
        tsconfig: resolvePath('tsconfig.json'),
      })
    ]
  }
  const outputOptions: rollup.OutputOptions = {
    file: isServer ? resolvePath('lib/server.js') : resolvePath('lib/client.js'),
    format: isServer ? 'commonjs' : 'umd',
    name: 'ServerRenderer',
  }

  return {
    inputOptions,
    outputOptions,
  }
}
