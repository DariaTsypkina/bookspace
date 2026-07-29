# @bookspace/schemas

Shared Zod v4 schemas and inferred input types for Bookspace domains.

## Naming convention

- Input schemas use `XxxInputSchema`.
- Inferred types use `XxxInput`.

## Domain exports

- `@bookspace/schemas` - all public schemas/types.
- `@bookspace/schemas/auth` - auth input schemas/types.
- `@bookspace/schemas/search` - search input schemas/types.
- `@bookspace/schemas/admin-context` - admin context-reading input schemas/types.

## Current baseline schemas

- Auth: `LoginInputSchema`, `RegisterInputSchema`.
- Search: `SearchBooksInputSchema`.
- Admin context: `AdminContextPublishInputSchema`.
