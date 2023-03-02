import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import config from './src/config.json'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    server: {
      port: config.vite_port
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    server: {
      port: config.vite_port
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      port: config.vite_port
    }
  }
})
