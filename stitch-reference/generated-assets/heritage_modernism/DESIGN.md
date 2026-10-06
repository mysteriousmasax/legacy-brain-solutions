---
name: Heritage Modernism
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#44474e'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000d0f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00262a'
  on-tertiary-container: '#0097a5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#8ff2ff'
  tertiary-fixed-dim: '#43d9ea'
  on-tertiary-fixed: '#001f23'
  on-tertiary-fixed-variant: '#004f56'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  heritage-navy: '#002147'
  legacy-gold: '#C5A059'
  professional-cyan: '#2ACADB'
  charcoal-text: '#333333'
  surface-muted: '#F6F5F5'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter-desktop: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system establishes a visual language of "Heritage Modernism" for a premier Tanzanian CPA firm. The brand personality is authoritative yet accessible, balancing the weight of financial tradition with the efficiency of modern technology. It targets high-net-worth individuals and corporate entities who value stability, precision, and excellence.

The aesthetic leans into **Corporate Modernism** with a **Minimalist** foundation. It utilizes generous whitespace to convey a sense of calm and clarity—essential for complex financial data. The interface avoids unnecessary flourishes, instead using precision-engineered typography and subtle tonal layering to establish a prestigious, "legacy" feel that inspires immediate trust.

## Colors

The palette is anchored by **Heritage Navy**, a deep, institutional blue that evokes stability and history. **Legacy Gold** is used sparingly as a "hallmark" color for secondary actions, borders, or accents that signify high-tier services and excellence.

For functional interaction, **Professional Cyan** provides a vibrant, modern contrast for primary calls-to-action, ensuring they are easily discoverable without compromising the formal atmosphere. The neutral scale relies on **Charcoal** for primary text and **Surface Muted** for subtle section backgrounds, creating a soft contrast that is easier on the eyes than pure black and white.

## Typography

The typography strategy employs a high-contrast pairing: **Playfair Display** for headlines to signal prestige and literary tradition, and **Inter** for body copy to ensure maximum legibility and a contemporary edge.

Headlines should use tight letter-spacing to appear more cohesive and architectural. Body text utilizes ample line-height to maintain a "light" feel despite the dense nature of financial content. Labels and small metadata should be set in Inter with increased letter-spacing and uppercase styling to provide a structural, "tabulated" look reminiscent of high-end ledger reports.

## Layout & Spacing

This design system uses a **12-column fixed grid** for desktop (max-width 1280px) to maintain a centered, curated feel. For mobile, it transitions to a **4-column fluid grid**.

The layout philosophy emphasizes "Breathe-ability." Section gaps are intentionally large (120px+) to separate different service offerings or value propositions clearly. Alignment should be strictly mathematical; use the 8px base unit for all component-level padding and margins to ensure the interface feels "calculated" and precise, mirroring the firm's accounting expertise.

## Elevation & Depth

Hierarchy is established primarily through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows.

1.  **Surfaces:** The primary background is white. Secondary content areas use `surface-muted` (#F6F5F5) to create subtle separation.
2.  **Outlines:** Use 1px solid borders in a very light version of Heritage Navy (approx. 10% opacity) or Legacy Gold to define cards and input fields.
3.  **Shadows:** When necessary for interactive elements like dropdowns or hover states on cards, use an "Ambient Shadow"—an extremely soft, diffused blur (20px-40px) with a low opacity (5-8%) tint of the primary color to avoid a "muddy" gray look.

## Shapes

To maintain a professional and sturdy appearance, the design system uses **Soft (0.25rem)** roundedness. This subtle curve removes the "aggressiveness" of sharp corners while remaining significantly more formal than highly rounded or pill-shaped designs. Buttons and input fields should strictly adhere to this radius to maintain a cohesive, "machined" look.

## Components

*   **Buttons:** Primary buttons use a solid Professional Cyan fill with white text. Secondary buttons use a Heritage Navy outline with Legacy Gold text for a prestigious "Gold Label" feel.
*   **Inputs:** Fields should be rectangular with a 1px border. Use the secondary background color for the field fill to make them feel "recessed" into the page.
*   **Cards:** Use minimal cards with no background (white on white) defined only by a 1px `surface-muted` border. On hover, apply the soft ambient shadow.
*   **Dividers:** Use thin, horizontal dividers in Legacy Gold (#C5A059) at 30% opacity to separate sections within a page or items in a list.
*   **Photography:** Use high-resolution, slightly desaturated imagery of modern architecture in Dar es Salaam, professional office environments, and candid team interactions. Avoid generic stock photos; favor environmental portraits that feel authentic to the Tanzanian business context.
*   **Data Visualization:** Tables and charts should use Professional Cyan for data points, set against a clean, grid-based layout with Inter-regular for numerical data.