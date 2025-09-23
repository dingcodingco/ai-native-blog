# Suggested Commands

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## Testing Commands
- `npx playwright test` - Run E2E tests
- `npx playwright test --ui` - Run tests with UI

## Package Management
- `pnpm install` - Install dependencies
- `pnpm add <package>` - Add dependency
- `pnpm add -D <package>` - Add dev dependency

## Git Commands (following project conventions)
- Create feature branch: `git checkout -b feature/[issue-number]-[description]`
- Commit with conventional commits: `git commit -m "feat: description"`
- Push and create PR following template

## Build and Deploy
- Build check: `pnpm build`
- Type check: `npx tsc --noEmit`
- Lint: No explicit linter configured