# Scriblli Landing Page Design System

This document outlines the design system used in the Scriblli landing pages, matching the main application.

## Brand Identity

### Primary Color - Scriblli Green
- **Main**: `hsl(83, 47%, 64%)` - #A6C96A
- **Variants**: 50-900 scale from light to dark
- **Usage**: Primary buttons, links, accents, focus states

### Typography
- **Font Family**: Inter (Variable Font)
- **Weights**: 100-900 (variable)
- **Headings**: 600 weight, -0.02em letter-spacing
- **Body**: 400-500 weight, normal letter-spacing

## Design Philosophy

### Bauhaus-Inspired
- **Form Follows Function**: Every element serves a purpose
- **Geometric Shapes**: Clean lines, minimal curves
- **Minimal Decoration**: Focus on content and usability
- **Functional Transitions**: 150ms linear for all interactions

## Color Palette

### Primary (Scriblli Green)
```css
--primary-50: hsl(83, 47%, 97%)
--primary-100: hsl(83, 47%, 94%)
--primary-200: hsl(83, 47%, 87%)
--primary-300: hsl(83, 47%, 81%)
--primary-400: hsl(83, 47%, 74%)
--primary-500: hsl(83, 47%, 64%)  /* Main brand color */
--primary-600: hsl(83, 47%, 54%)
--primary-700: hsl(83, 47%, 41%)
--primary-800: hsl(83, 47%, 27%)
--primary-900: hsl(83, 47%, 14%)
```

### Neutrals
```css
--neutral-50: hsl(0, 0%, 96%)
--neutral-100: hsl(0, 0%, 91%)
--neutral-200: hsl(0, 0%, 82%)
--neutral-300: hsl(0, 0%, 69%)
--neutral-400: hsl(0, 0%, 53%)
--neutral-500: hsl(0, 0%, 43%)
--neutral-600: hsl(0, 0%, 36%)
--neutral-700: hsl(0, 0%, 31%)
--neutral-800: hsl(0, 0%, 27%)
--neutral-900: hsl(0, 0%, 24%)
```

## Components

### Buttons

**Primary Button**
- Background: `hsl(83, 47%, 64%)`
- Text: `hsl(83, 47%, 10%)`
- Padding: 12px 24px
- Border Radius: 0.25rem (geometric)
- Shadow: Flat (0 2px 4px rgba(0,0,0,0.1))
- Hover: 90% opacity

**Secondary Button**
- Background: `hsl(210, 40%, 96.1%)`
- Text: `hsl(222.2, 47.4%, 11.2%)`
- Border: 1px solid border color
- Same padding and radius as primary

**Outline Button**
- Background: transparent
- Border: 2px solid primary
- Text: primary color
- Hover: Fill with primary color

### Cards
- Background: White
- Border: 1px solid `hsl(214.3, 31.8%, 91.4%)`
- Border Radius: 0.25rem
- Shadow: Minimal (0 1px 3px rgba(0,0,0,0.1))
- Hover: Flat shadow + primary border tint

### Inputs
- Border: 1px solid input color
- Border Radius: 0.25rem
- Padding: 8px 16px
- Focus: 2px ring in primary color

## Spacing Scale

Based on 4px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

## Layout

### Container
- Max Width: 1280px (7xl)
- Padding: 16px (sm), 24px (md), 32px (lg)

### Section Padding
- Vertical: 64px (lg: 96px)

## Typography Scale

### Headings
- XL: 48px (sm: 60px, lg: 72px)
- LG: 36px (sm: 48px)
- MD: 30px (sm: 36px)
- SM: 24px (sm: 30px)

### Body
- Base: 16px (sm: 18px)
- Small: 14px
- XS: 12px

## Shadows

### Minimal
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### Flat
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

## Border Radius

- **Sharp**: 0
- **Minimal**: 0.125rem (2px)
- **Geometric**: 0.25rem (4px)
- **Standard**: 0.5rem (8px)

## Transitions

All transitions use: `150ms linear`

## Responsive Breakpoints

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Usage Guidelines

### Do's
✅ Use Scriblli green for primary actions
✅ Maintain geometric, clean shapes
✅ Use Inter font consistently
✅ Keep shadows minimal
✅ Use functional transitions (150ms linear)
✅ Maintain consistent spacing

### Don'ts
❌ Don't use rounded corners > 0.5rem
❌ Don't use heavy shadows or gradients
❌ Don't use decorative elements
❌ Don't use slow transitions
❌ Don't mix font families
❌ Don't use bright, saturated colors besides primary

## Accessibility

- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Focus indicators: 2px ring in primary color
- Keyboard navigation: All interactive elements
- ARIA labels: Where appropriate

## File Structure

```
scriblli-landing/
├── css/
│   ├── scriblli-theme.css    # Main theme file
│   └── styles.css             # Legacy (can be deprecated)
├── fonts/
│   ├── inter-variablefont_opsz,wght.ttf
│   └── inter-italic-variablefont_opsz,wght.ttf
├── index.html
├── pricing.html
├── features.html
├── about.html
├── contact.html
└── faq.html
```

## Implementation Notes

1. Replace Tailwind CDN with proper Tailwind build process for production
2. All pages should use `scriblli-theme.css` instead of external CDN
3. Remove Font Awesome dependency where possible, use SVG icons
4. Ensure all interactive elements have proper focus states
5. Test on mobile devices for responsive behavior
