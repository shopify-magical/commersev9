/**
 * Build Configuration for Modern CSS System
 * 
 * This configuration sets up the build pipeline for:
 * - PostCSS transformation
 * - PurgeCSS for unused CSS removal
 * - CSS Nano for minification
 * - Bundle optimization
 */

module.exports = {
  // PostCSS configuration
  postcss: {
    plugins: {
      'postcss-import': {},
      'autoprefixer': {
        browsers: ['last 2 versions', 'ie >= 11']
      },
      'cssnano': {
        preset: 'advanced'
      }
    }
  },

  // PurgeCSS configuration
  purgecss: {
    content: [
      './public/**/*.html',
      './public/**/*.js'
    ],
    css: [
      './public/css/utilities/*.css',
      './public/css/critical/*.css'
    ],
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    safelist: {
      standard: [/^active-/, /^focus-/, /^hover-/],
      deep: [/^bg-/, /^text-/],
      greedy: [/^bg-/, /^text-/]
    }
  },

  // Bundle size limits
  budgets: [
    {
      type: 'stylesheet',
      maxSize: '30 KB',
      path: ['css/**/*.css']
    },
    {
      type: 'script',
      maxSize: '200 KB',
      path: ['js/**/*.js']
    }
  ],

  // Critical CSS extraction
  criticalCSS: {
    width: 1280,
    height: 800,
    timeout: 30000
  },

  // File organization
  structure: {
    css: {
      critical: 'public/css/critical/',
      utilities: 'public/css/utilities/',
      components: 'public/css/components/',
      themes: 'public/css/themes/'
    },
    js: {
      core: 'public/js/core/',
      lazy: 'public/js/lazy/',
      components: 'public/js/components/'
    }
  }
};
