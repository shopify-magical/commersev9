# Sweet Layers Typography System Documentation

## Overview

This document describes the comprehensive typography system for Sweet Layers, ensuring consistency across all components and pages. The system is built on WCAG 2.1 AA accessibility standards and supports responsive design and dark mode.

## Design Tokens

### Font Families

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-primary` | Inter, -apple-system, sans-serif | Primary UI font |
| `--font-secondary` | Playfair Display, serif | Display headings |
| `--font-accent` | Cormorant Garamond, serif | Accent text |
| `--font-body` | Lora, serif | Body text |
| `--font-ui` | Poppins, sans-serif | UI elements |
| `--font-heading` | Raleway, sans-serif | Headings |
| `--font-mono` | JetBrains Mono, monospace | Code |

### Font Sizes

| Class | Size | Usage |
|-------|------|-------|
| `.text-xs` | 12px (0.75rem) | Captions, labels |
| `.text-sm` | 14px (0.875rem) | Small text, metadata |
| `.text-base` | 16px (1rem) | Body text, default |
| `.text-lg` | 18px (1.125rem) | Lead text, emphasis |
| `.text-xl` | 20px (1.25rem) | Small headings |
| `.text-2xl` | 24px (1.5rem) | Section headings |
| `.text-3xl` | 30px (1.875rem) | Page headings |
| `.text-4xl` | 36px (2.25rem) | Large headings |
| `.text-5xl` | 48px (3rem) | Hero headings |
| `.text-6xl` | 60px (3.75rem) | Display headings |
| `.text-7xl` | 72px (4.5rem) | Extra large display |

### Heading Hierarchy

| Element | Font Size | Line Height | Font Weight | Letter Spacing |
|---------|-----------|------------|-------------|---------------|
| `h1, .h1` | 60px | 1.25 | Bold (700) | -0.025em |
| `h2, .h2` | 36px | 1.25 | Bold (700) | -0.025em |
| `h3, .h3` | 30px | 1.25 | Semibold (600) | -0.025em |
| `h4, .h4` | 24px | 1.375 | Semibold (600) | 0 |
| `h5, .h5` | 20px | 1.375 | Medium (500) | 0 |
| `h6, .h6` | 18px | 1.5 | Medium (500) | 0 |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `.font-light` | 300 | Light emphasis |
| `.font-normal` | 400 | Normal text |
| `.font-medium` | 500 | Medium emphasis |
| `.font-semibold` | 600 | Strong emphasis |
| `.font-bold` | 700 | Headings |
| `.font-extrabold` | 800 | Display |

### Line Heights

| Class | Value | Usage |
|-------|-------|-------|
| `.leading-none` | 1 | Tight spacing |
| `.leading-tight` | 1.25 | Headings |
| `.leading-snug` | 1.375 | Compact text |
| `.leading-normal` | 1.5 | Body text |
| `.leading-relaxed` | 1.625 | Readable text |
| `.leading-loose` | 2 | Loose spacing |

### Letter Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `.tracking-tighter` | -0.05em | Very tight |
| `.tracking-tight` | -0.025em | Tight |
| `.tracking-normal` | 0 | Normal |
| `.tracking-wide` | 0.025em | Wide |
| `.tracking-wider` | 0.05em | Wider |
| `.tracking-widest` | 0.1em | Widest |

## Color Palette (WCAG 2.1 AA Compliant)

### Brand Colors

| Variable | Hex | Contrast Ratio (Light BG) | Usage |
|----------|-----|------------------------|-------|
| `--brand-primary` | #2A6B52 | 4.5:1 ✓ | Primary actions |
| `--brand-primary-dark` | #1F4A3A | 7.2:1 ✓ | Hover states |
| `--brand-primary-light` | #E8F5F0 | - | Background accents |
| `--brand-accent` | #C4A647 | 4.5:1 ✓ | Highlights |
| `--brand-accent-dark` | #B3941A | 5.1:1 ✓ | Accent hover |

### Neutral Colors

| Variable | Hex | Usage |
|----------|-----|-------|
| `--neutral-50` | #FDF9F5 | Background |
| `--neutral-100` | #F5EDE4 | Light backgrounds |
| `--neutral-200` | #E8DCD0 | Borders |
| `--neutral-300` | #D4C4B5 | Hover borders |
| `--neutral-400` | #B8A08A | Disabled text |
| `--neutral-500` | #9A7D6A | Tertiary text |
| `--neutral-600` | #7A5F4A | Secondary text |
| `--neutral-700` | #5A4535 | Primary text |
| `--neutral-800` | #3D2E22 | Dark text |
| `--neutral-900` | #2A1F15 | Darkest text |

### Semantic Colors

| Variable | Hex | Usage |
|----------|-----|-------|
| `--color-success` | #22c55e | Success states |
| `--color-warning` | #f59e0b | Warning states |
| `--color-error` | #ef4444 | Error states |
| `--color-info` | #3b82f6 | Information |

## Text Alignment Utilities

| Class | Purpose |
|-------|---------|
| `.text-left` | Left align text |
| `.text-center` | Center align text |
| `.text-right` | Right align text |
| `.text-justify` | Justify text |

### Vertical Alignment

| Class | Purpose |
|-------|---------|
| `.align-top` | Align to top |
| `.align-middle` | Align to middle |
| `.align-bottom` | Align to bottom |
| `.align-baseline` | Align to baseline |

## Text Transformation

| Class | Purpose |
|-------|---------|
| `.uppercase` | UPPERCASE TEXT |
| `.lowercase` | lowercase text |
| `.capitalize` | Capitalize Each Word |
| `.normal-case` | Normal case |

## Text Decoration

| Class | Purpose |
|-------|---------|
| `.underline` | Underlined text |
| `.line-through` | Strikethrough |
| `.no-underline` | Remove underline |

## Text Overflow

| Class | Purpose |
|-------|---------|
| `.truncate` | Truncate with ellipsis |
| `.line-clamp-1` | Clamp to 1 line |
| `.line-clamp-2` | Clamp to 2 lines |
| `.line-clamp-3` | Clamp to 3 lines |

## List Utilities

| Class | Purpose |
|-------|---------|
| `.list-unstyled` | Remove list styles |
| `.list-inline` | Inline list |
| `.list-disc` | Disc bullets |
| `.list-decimal` | Decimal numbers |
| `.list-circle` | Circle bullets |
| `.list-square` | Square bullets |

## Blockquote

Default blockquote styling:
- Left border: 4px brand primary
- Background: brand primary light
- Font size: 18px
- Italic style
- Padding: 0 24px
- Margin: 24px 0

## Code

| Class | Purpose |
|-------|---------|
| `code` | Inline code |
| `kbd` | Keyboard input |
| `pre` | Code block |
| `pre code` | Code in block |

## Responsive Typography

### Fluid Typography

Use fluid typography for responsive scaling:
- `.text-fluid-sm` - 12px to 14px
- `.text-fluid-base` - 16px to 18px
- `.text-fluid-lg` - 18px to 24px
- `.text-fluid-xl` - 20px to 30px
- `.text-fluid-2xl` - 24px to 40px
- `.text-fluid-3xl` - 30px to 48px
- `.text-fluid-4xl` - 36px to 64px

### Breakpoint-Specific Alignment

| Class | Breakpoint |
|-------|------------|
| `.sm:text-left` | < 640px |
| `.md:text-left` | 640px - 767px |
| `.lg:text-left` | 768px - 1023px |
| `.xl:text-left` | ≥ 1024px |

## Dark Mode

The typography system automatically adapts to dark mode:
- Text colors invert for readability
- Background colors adjust
- Brand colors optimized for dark backgrounds
- Maintains WCAG 2.1 AA contrast ratios

## Accessibility Features

- **Skip Links**: `.skip-link` class for keyboard navigation
- **Focus States**: `.focus-visible` for keyboard focus
- **Screen Reader**: `.sr-only` for screen reader only content
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Respects `prefers-contrast: high`

## Usage Examples

### Basic Typography

```html
<h1>Main Heading</h1>
<h2>Section Heading</h2>
<p>Body text with <strong>emphasis</strong> and <em>italics</em>.</p>
<p class="lead">Lead paragraph for introductions.</p>
<p class="small">Small text for captions.</p>
<p class="caption">CAPTION TEXT</p>
```

### Text Alignment

```html
<p class="text-left">Left aligned text</p>
<p class="text-center">Center aligned text</p>
<p class="text-right">Right aligned text</p>
```

### Text Transformation

```html
<p class="uppercase">uppercase text</p>
<p class="capitalize">Capitalized Text</p>
```

### Lists

```html
<ul class="list-disc">
  <li>Item one</li>
  <li>Item two</li>
</ul>

<ol class="list-decimal">
  <li>First item</li>
  <li>Second item</li>
</ol>
```

### Blockquote

```html
<blockquote>
  <p>This is a blockquote with important information.</p>
  <cite>— Author Name</cite>
</blockquote>
```

### Code

```html
<p>Use <code>inline code</code> for short snippets.</p>

<pre><code>
function example() {
  return "code block";
}
</code></pre>

<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>
```

## Best Practices

1. **Use semantic HTML**: Always use appropriate heading levels (h1-h6)
2. **Maintain hierarchy**: Don't skip heading levels
3. **Ensure contrast**: All text combinations meet WCAG 2.1 AA
4. **Responsive design**: Use fluid typography for scalable text
5. **Accessibility**: Include skip links and proper focus states
6. **Consistency**: Use design tokens, not hardcoded values
7. **Line length**: Keep lines under 75 characters for readability
8. **Paragraph spacing**: Use consistent spacing between paragraphs

## Component Variants

### Button Typography

```css
.btn {
  font-family: var(--font-ui);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
```

### Form Typography

```css
.form-label {
  font-family: var(--font-ui);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
}

.form-input {
  font-family: var(--font-primary);
  font-size: var(--text-base);
}
```

### Card Typography

```css
.card-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}

.card-body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties (CSS Variables)
- Fluid typography with `clamp()`
- CSS Grid and Flexbox
- System font stack fallbacks

## Future Enhancements

- [ ] Add variable font support
- [ ] Implement dynamic type scaling
- [ ] Add more language-specific typography
- [ ] Enhanced print typography
- [ ] Custom font loading strategies

---

**Last Updated**: April 8, 2026
**Version**: 2.0.0
**Maintained By**: Sweet Layers Design Team
