# @bookspace/schemas

Shared Zod v4 schemas and inferred input types for Bookspace domains.

## Naming convention

- Input schemas use `XxxInputSchema`.
- Inferred types use `XxxInput`.

## Build

`@bookspace/schemas` compiles TypeScript to CommonJS in `dist/` for Nest/Jest/Next consumers.

```bash
pnpm --filter @bookspace/schemas build
```

API and web test/build scripts run this step automatically via `pretest`/`prebuild` hooks.

## Domain exports

- `@bookspace/schemas` - all public schemas/types.
- `@bookspace/schemas/auth` - auth input schemas/types.
- `@bookspace/schemas/search` - search input schemas/types.
- `@bookspace/schemas/admin-context` - admin context-reading input schemas/types.

## Current baseline schemas

- Auth: `LoginInputSchema`, `RegisterInputSchema`.
- Search: `SearchBooksInputSchema`, `SearchQueryFormSchema`, `CatalogSearchQuerySchema`.
- Admin context: `AdminContextPublishInputSchema`, `AdminContextListRecentQuerySchema`, `AdminContextPatchInputSchema`, `AdminContextPatchFormSchema`, `AdminContextExtractInputSchema`.
