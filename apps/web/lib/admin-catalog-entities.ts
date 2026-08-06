import { api, noStoreConfig } from './http';
import type {
  AdminCreateCharacterInput,
  AdminCreatePlaceInput,
  AdminCreateSeriesInput,
  AdminCreateWorldInput,
  AdminUpdateCharacterInput,
  AdminUpdatePlaceInput,
  AdminUpdateSeriesInput,
  AdminUpdateWorldInput,
} from '@bookspace/schemas';
import { statusLabel as workStatusLabel } from './admin-catalog';

export type CatalogEntityStatus = 'DRAFT' | 'PUBLISHED';

export type AdminCatalogEntityListItem = {
  id: string;
  slug: string;
  nameRu: string;
  nameOrig: string | null;
  status: CatalogEntityStatus;
  deletedAt: string | null;
  updatedAt: string;
  createdAt: string;
  descriptionRu?: string | null;
  worldId?: string | null;
  world?: { id: string; slug: string; nameRu: string } | null;
};

export type CatalogEntityKind = 'series' | 'characters' | 'worlds' | 'places';

const ADMIN_BFF_BASE = '/api/admin';

export function entityStatusLabel(status: CatalogEntityStatus): string {
  return workStatusLabel(status);
}

export async function fetchAdminCatalogEntities(
  kind: CatalogEntityKind,
  q?: string,
): Promise<AdminCatalogEntityListItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const qs = params.toString();
  const { data } = await api.get<AdminCatalogEntityListItem[]>(
    `${ADMIN_BFF_BASE}/${kind}${qs ? `?${qs}` : ''}`,
    noStoreConfig,
  );
  return data;
}

export async function fetchAdminCatalogEntity(
  kind: CatalogEntityKind,
  id: string,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.get<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/${kind}/${id}`,
    noStoreConfig,
  );
  return data;
}

export async function createAdminSeries(
  input: AdminCreateSeriesInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.post<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/series`,
    input,
  );
  return data;
}

export async function createAdminCharacter(
  input: AdminCreateCharacterInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.post<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/characters`,
    input,
  );
  return data;
}

export async function createAdminWorld(
  input: AdminCreateWorldInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.post<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/worlds`,
    input,
  );
  return data;
}

export async function createAdminPlace(
  input: AdminCreatePlaceInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.post<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/places`,
    input,
  );
  return data;
}

export async function updateAdminSeries(
  id: string,
  input: AdminUpdateSeriesInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.patch<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/series/${id}`,
    input,
  );
  return data;
}

export async function updateAdminCharacter(
  id: string,
  input: AdminUpdateCharacterInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.patch<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/characters/${id}`,
    input,
  );
  return data;
}

export async function updateAdminWorld(
  id: string,
  input: AdminUpdateWorldInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.patch<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/worlds/${id}`,
    input,
  );
  return data;
}

export async function updateAdminPlace(
  id: string,
  input: AdminUpdatePlaceInput,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.patch<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/places/${id}`,
    input,
  );
  return data;
}

export async function publishAdminCatalogEntity(
  kind: CatalogEntityKind,
  id: string,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.post<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/${kind}/${id}/publish`,
  );
  return data;
}

export async function softDeleteAdminCatalogEntity(
  kind: CatalogEntityKind,
  id: string,
): Promise<AdminCatalogEntityListItem> {
  const { data } = await api.delete<AdminCatalogEntityListItem>(
    `${ADMIN_BFF_BASE}/${kind}/${id}`,
  );
  return data;
}

export function publicPathForEntity(
  kind: CatalogEntityKind,
  slug: string,
): string {
  switch (kind) {
    case 'series':
      return `/series/${slug}`;
    case 'characters':
      return `/characters/${slug}`;
    case 'worlds':
      return `/worlds/${slug}`;
    case 'places':
      return `/places/${slug}`;
  }
}
