/**
 * Rollup Configuration
 * 
 * Bundles JavaScript for production with:
 * - Tree shaking
 * - Code splitting
 * - Minification
 */

import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
  input: {
    'core': 'public/js/polyfills.js',
    'lazy-loader': 'public/js/lazy-loader.js',
    'performance-monitor': 'public/js/performance-monitor.js'
  },
  output: {
    dir: 'public/dist/js',
    format: 'es',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    terser({
      ecma: 2020,
      module: true,
      compress: {
        drop_console: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        toplevel: true
      }
    })
  ],
  external: [],
  preserveEntrySignatures: 'strict'
};
