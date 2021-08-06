// // @ts-nocheck
// import { IRailing, IRailingConfigAPI } from '@railing/types'
// import { RailingReactRendererPlugin } from '@railing/react-renderer/plugin'

const railingConfig = {
  ssr: true,
  entry: '',
  outputDir: '',
  runtimeConfig: {},
  plugins: [
    (api) => {
      api.hooks.webpack.tap('XxPlugin', (webpackConfig) => {});

      api.hooks.railingConfig.tap('XxPlugin', (railingConfig) => {});
    },
  ],
};
