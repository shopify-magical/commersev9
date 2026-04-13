/**
 * PostCSS Configuration
 * 
 * Processes CSS with modern transformations:
 * - Import inlining
 * - Autoprefixer for vendor prefixes
 * - CSS Nano for minification
 */

module.exports = {
  plugins: {
    'postcss-import': {
      path: ['public/css']
    },
    'autoprefixer': {
      browsers: [
        'last 2 versions',
        'ie >= 11',
        '> 1%',
        'not dead'
      ],
      flexbox: 'no-2009',
      grid: true
    },
    'cssnano': {
      preset: [
        'advanced',
        {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: false,
          minifyFontValues: false,
          minifySelectors: false
        }
      ]
    }
  }
};
