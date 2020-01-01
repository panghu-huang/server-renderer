import { rollup } from 'rollup'
import { createRollupConfig } from '../config/rollup-config'

async function build(isServer: boolean) {
  const rollupConfig = createRollupConfig(isServer)
  const bundle = await rollup(rollupConfig.inputOptions)
  await bundle.write(rollupConfig.outputOptions)
}

async function buildEveryThing() {
  await build(true)
  await build(false)
}

buildEveryThing()
