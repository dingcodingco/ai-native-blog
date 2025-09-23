# Code Style and Conventions

## File Structure
- App Router structure (`app/` directory)
- Components in `app/components/`
- Blog posts in `app/blog/posts/` as `.mdx` files
- Utilities in `app/blog/utils.ts`

## TypeScript Conventions
- Strict TypeScript usage
- Interface definitions for metadata types
- Proper type exports and imports
- React.FC not used, prefer direct function components

## Styling
- Tailwind CSS for all styling
- Dark mode support with CSS variables
- Responsive design patterns (mobile-first)
- Component-level styling within JSX

## Component Patterns
- Server Components by default
- Client Components when needed (theme provider)
- Proper metadata exports for pages
- Clean separation of concerns

## File Naming
- kebab-case for file names
- PascalCase for component names
- camelCase for functions and variables