# Directories

## api
- Contains API route handlers for the Next.js Pages Router.

## api-documentation
- Pages related to API documentation.

## mods
- Pages related to browsing, searching, and viewing mods.

# Files

## _app.tsx
- Main Next.js application component that wraps all pages.

## _document.tsx
- Custom Next.js Document component for modifying the initial HTML and body tags.

## coming-soon.tsx
- Page displayed for features that are under development.

## defaultIndex.module.css
- CSS module for styling the default index page.

## defaultIndex.tsx
- Alternative home page used for development or testing.

## faq.tsx
- Frequently Asked Questions page.

## index.tsx
- Main homepage of the CelesteMods website.

# Common Specifications

## Page Structure

Defines the standard structure of Next.js pages.

Tags: pages, next.js, routing

- Pages use a consistent layout structure
- Pages handle their own SEO metadata
- Pages handle server-side and client-side data fetching appropriately
- Pages implement responsive designs for various screen sizes

#### Page Navigation
Describes how navigation between pages works.

  Tags: navigation, links

- Links between pages use Next.js Link component for client-side navigation
- Navigation preserves state when appropriate
- Navigation includes appropriate loading indicators
- Browser history is properly maintained during navigation