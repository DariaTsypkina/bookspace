import type { NoteType, PublicNoteItem } from '@bookspace/schemas';

/** Сырая заметка до фильтрации (модель Note может появиться в bd-sf4). */
export type NoteCandidate = {
  id: string;
  type: NoteType;
  body: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  workSlug?: string;
  pageRef?: string | null;
};

/**
 * Публичный профиль: только visibility=PUBLIC.
 * PRIVATE никогда не попадают в ответ (контракт до появления модели Note).
 */
export function filterPublicNotes(
  notes: readonly NoteCandidate[],
): PublicNoteItem[] {
  return notes
    .filter((note) => note.visibility === 'PUBLIC')
    .map(({ id, type, body, workSlug, pageRef }) => ({
      id,
      type,
      body,
      ...(workSlug !== undefined ? { workSlug } : {}),
      ...(pageRef !== undefined ? { pageRef } : {}),
    }));
}
