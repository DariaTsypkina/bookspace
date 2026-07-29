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
- `@bookspace/schemas/catalog` - catalog entity slug / needs-context schemas.
- `@bookspace/schemas/library` - library/profile input schemas.
- `@bookspace/schemas/relations` - spoiler cookie + relation type schemas.
- `@bookspace/schemas/rankings` - ranking status/slug + future job inputs.
- `@bookspace/schemas/collections` - collection status/slug.
- `@bookspace/schemas/admin` - remaining admin path params.

## Current baseline schemas

- Auth: `LoginInputSchema`, `RegisterInputSchema`.
- Search: `SearchBooksInputSchema`, `SearchQueryFormSchema`, `CatalogSearchQuerySchema`.
- Admin context: `AdminContextPublishInputSchema`, `AdminContextListRecentQuerySchema`, `AdminContextPatchInputSchema`, `AdminContextPatchFormSchema`, `AdminContextExtractInputSchema`.
- Admin params: `AdminWorkIdParamSchema`, `AdminContextReadingIdParamSchema`.
- Catalog: `CatalogEntitySlugParamSchema`, `AdminWorkNeedsContextPatchInputSchema`.
- Library: `AddLibraryItemInputSchema`, `ProfileSlugParamSchema`.
- Relations/spoiler: `SpoilersOkCookieValueSchema`, `SpoilersConsentInputSchema`, `CharacterRelationTypeSchema`, `WorkRelationTypeSchema`.
- Rankings: `RankingStatusSchema`, `RankingSlugParamSchema`, `ExternalRankingMatchStatusSchema`, `RankingsImportSourceInputSchema`, `RankingsAggregatePublishInputSchema`.
- Collections: `CollectionStatusSchema`, `CollectionSlugParamSchema`.
