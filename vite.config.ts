import path from 'path'
import { loadEnv } from 'vite'
import type { ConfigEnv, UserConfig } from 'vite'

import { visualizer } from 'rollup-plugin-visualizer'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({ mode }: ConfigEnv): UserConfig => {
  const root = process.cwd()
  const env = loadEnv(mode, root)

  return {
    base: env.VITE_APP_PUBLIC_PATH,

    define: {
      'process.env.VUE_APP_API_BASE_URL': JSON.stringify(env.VITE_APP_API_BASE_URL),
      'process.env.VUE_APP_PUBLIC_PATH': JSON.stringify(env.VITE_APP_PUBLIC_PATH),
    },

    plugins: [
      vue(),
      vueJsx(),
      visualizer(),

      legacy({
        targets: ['defaults', 'not IE 11'],
      }),

      Components({
        dts: true,
        resolvers: [VantResolver()],
        types: [],
      }),

      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/,
          /\.vue\?vue/,
        ],
        imports: [
          'vue',
          'vue-router',
          'vitest',
        ],
        dts: true,
        eslintrc: {
          enabled: true,
        },
      }),
    ],

    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2048,
    },

    resolve: {
      alias: {
        '~@': path.join(__dirname, './src'),
        '@': path.join(__dirname, './src'),
        '~': path.join(__dirname, './src/assets'),
      },
    },

    server: {
      host: true,
      port: 3000,
    },
  }
}
