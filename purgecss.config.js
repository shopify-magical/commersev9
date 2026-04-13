/**
 * PurgeCSS Configuration
 * 
 * Removes unused CSS by scanning HTML and JavaScript files
 * Safelists critical classes and patterns
 */

module.exports = {
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './public/**/*.jsx'
  ],
  css: [
    './public/css/utilities/*.css',
    './public/css/critical/*.css',
    './public/css/components/*.css'
  ],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
  safelist: {
    standard: [
      /^active-/,
      /^focus-/,
      /^hover-/,
      /^visited-/,
      /^disabled-/
    ],
    deep: [
      /^bg-/,
      /^text-/,
      /^border-/,
      /^shadow-/,
      /^transition-/
    ],
    greedy: [
      /^bg-/,
      /^text-/,
      /^p-/,
      /^m-/,
      /^gap-/
    ]
  },
  blocklist: [
    'archived'
  ],
  keyframes: [
    'spin',
    'pulse',
    'bounce',
    'fade-in',
    'slide-in'
  ]
};
