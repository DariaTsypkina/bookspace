import { describe, expect, it } from 'vitest';
import {
  MATCH_QUEUE_KIND_LABELS,
  MATCH_QUEUE_STATUS_LABELS,
} from './admin-match-queue';

describe('admin-match-queue labels', () => {
  it('has Russian labels for kinds and statuses', () => {
    expect(MATCH_QUEUE_KIND_LABELS.IMPORT_ROW).toMatch(/Импорт/);
    expect(MATCH_QUEUE_STATUS_LABELS.OPEN).toBe('Открыт');
    expect(MATCH_QUEUE_STATUS_LABELS.DISMISSED).toBe('Отклонён');
  });
});
