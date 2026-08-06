import {
  AssignTagInputSchema,
  CreateTagInputSchema,
  UpdateTagInputSchema,
} from '@bookspace/schemas';
import { AssignTagDto, CreateTagDto, UpdateTagDto } from './me-tags.dto';

describe('Me tags Zod DTO shared schemas (bd-cq7.3)', () => {
  it('CreateTagDto requires non-empty trimmed name', () => {
    expect(CreateTagDto.schema.safeParse({}).success).toBe(false);
    expect(CreateTagDto.schema.safeParse({ name: '   ' }).success).toBe(false);

    const ok = CreateTagDto.schema.safeParse({ name: '  фэнтези  ' });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data).toEqual({ name: 'фэнтези' });
    }
  });

  it('CreateTag rejects oversized name', () => {
    expect(
      CreateTagInputSchema.safeParse({ name: 'т'.repeat(101) }).success,
    ).toBe(false);
  });

  it('UpdateTagDto requires name', () => {
    expect(UpdateTagDto.schema.safeParse({}).success).toBe(false);
    expect(UpdateTagInputSchema.safeParse({ name: 'новое' }).success).toBe(
      true,
    );
  });

  it('AssignTagDto requires tagId or name', () => {
    expect(AssignTagDto.schema.safeParse({}).success).toBe(false);
    expect(AssignTagInputSchema.safeParse({ name: 'классика' }).success).toBe(
      true,
    );
    expect(AssignTagInputSchema.safeParse({ tagId: 'tag-1' }).success).toBe(
      true,
    );
    expect(
      AssignTagInputSchema.safeParse({ name: 'т'.repeat(101) }).success,
    ).toBe(false);
  });
});
