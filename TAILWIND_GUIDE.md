# Tailwind CSS Integration Guide

This project now includes Tailwind CSS support for utility-first styling.

## What Was Added

### Dependencies
- `tailwindcss` - The core Tailwind CSS framework
- `postcss` - CSS processor required by Tailwind
- `autoprefixer` - Adds vendor prefixes automatically
- `postcss-loader` - Webpack loader for PostCSS processing

### Configuration Files
- `tailwind.config.js` - Tailwind configuration with content paths
- `postcss.config.js` - PostCSS configuration for Tailwind and Autoprefixer

### CSS Files
- `src/styles/tailwind.css` - Main Tailwind CSS imports
- Updated `src/pages/Content/content.styles.css` with Tailwind imports

### Webpack Configuration
- Added `postcss-loader` to the CSS processing pipeline
- CSS processing order: `style-loader` → `css-loader` → `postcss-loader` → `sass-loader`

## Usage Examples

### In React Components (JSX)
```jsx
// Before (inline styles)
<div style={{padding: '10px', backgroundColor: 'white', borderRadius: '5px'}}>

// After (Tailwind classes)
<div className="p-2.5 bg-white rounded-lg">
```

### Updated Components
- **Popup Component**: Converted from CSS classes to Tailwind utilities
- **Inject Component**: Partially converted inline styles to Tailwind classes

## Available Everywhere
Tailwind CSS is automatically available in:
- ✅ Popup (`src/pages/Popup/`)
- ✅ Options (`src/pages/Options/`)
- ✅ Content Scripts (`src/pages/Content/`)
- ✅ All components and subcomponents

## Common Tailwind Classes Used
- Layout: `fixed`, `absolute`, `w-full`, `h-full`, `flex`, `flex-col`
- Spacing: `p-2.5`, `m-4`, `top-2.5`, `right-2.5`
- Colors: `bg-white`, `bg-gray-800`, `text-blue-400`, `border-gray-300`
- Effects: `shadow-lg`, `rounded-lg`, `hover:text-blue-300`, `transition-colors`

## Building
The build process automatically:
1. Processes Tailwind directives through PostCSS
2. Purges unused CSS based on `tailwind.config.js` content paths
3. Adds vendor prefixes via Autoprefixer
4. Includes the processed CSS in the extension bundle

## Development
- Use Tailwind's utility classes instead of writing custom CSS
- The `tailwind.config.js` can be customized for project-specific needs
- VS Code may show linting warnings for `@tailwind` directives (this is normal)

## References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://tailwindcomponents.com/cheatsheet/)