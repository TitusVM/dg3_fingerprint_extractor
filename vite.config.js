import { defineConfig } from 'vite'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@li0ard/tsemrtd': './node_modules/@li0ard/tsemrtd/dist/index.js',
    }
  },
  optimizeDeps: {
    esbuildOptions: {},
    include: ['@li0ard/tsemrtd', 'node-tlv']
  },

  plugins: [
    nodePolyfills({
      // Explicitly enable the Buffer polyfill
      buffer: true,
      global: true,
      process: true
    }), 
    viteCommonjs()
  ],
})