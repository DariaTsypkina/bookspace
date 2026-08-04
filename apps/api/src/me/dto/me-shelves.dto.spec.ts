import {
  AddShelfItemInputSchema,
  CreateShelfInputSchema,
  UpdateShelfInputSchema,
} from '@bookspace/schemas';
import {
  AddShelfItemDto,
  CreateShelfDto,
  UpdateShelfDto,
} from './me-shelves.dto';

describe('Me shelves Zod DTO shared schemas (bd-cq7.2)', () => {
  it('CreateShelfDto requires non-empty title; slug/description optional', () => {
    expect(CreateShelfDto.schema.safeParse({}).success).toBe(false);
    expect(CreateShelfDto.schema.safeParse({ title: '   ' }).success).toBe(
      false,
    );

    const ok = CreateShelfDto.schema.safeParse({
      title: '  Любимое  ',
      description: ' Книги на вечер ',
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data).toEqual({
        title: 'Любимое',
        description: 'Книги на вечер',
      });
    }

    const withSlug = CreateShelfInputSchema.safeParse({
      title: 'Фантастика',
      slug: '  fantasy  ',
    });
    expect(withSlug.success).toBe(true);
    if (withSlug.success) {
      expect(withSlug.data.slug).toBe('fantasy');
      expect(withSlug.data.description).toBeUndefined();
    }
  });

  it('CreateShelf rejects oversized title/slug/description', () => {
    expect(
      CreateShelfInputSchema.safeParse({ title: 'т'.repeat(201) }).success,
    ).toBe(false);
    expect(
      CreateShelfInputSchema.safeParse({
        title: 'Ок',
        slug: 's'.repeat(201),
      }).success,
    ).toBe(false);
    expect(
      CreateShelfInputSchema.safeParse({
        title: 'Ок',
        description: 'd'.repeat(2001),
      }).success,
    ).toBe(false);
  });

  it('UpdateShelfDto requires at least one field', () => {
    expect(UpdateShelfDto.schema.safeParse({}).success).toBe(false);
    expect(UpdateShelfDto.schema.safeParse({ title: 'Новое' }).success).toBe(
      true,
    );
    expect(
      UpdateShelfInputSchema.safeParse({ description: null }).success,
    ).toBe(true);
    expect(UpdateShelfInputSchema.safeParse({ slug: 'new-slug' }).success).toBe(
      true,
    );
  });

  it('AddShelfItemDto requires workId or workSlug', () => {
    expect(AddShelfItemDto.schema.safeParse({}).success).toBe(false);
    expect(
      AddShelfItemInputSchema.safeParse({ workSlug: 'war-and-peace' }).success,
    ).toBe(true);
    expect(
      AddShelfItemInputSchema.safeParse({ workId: 'work-1' }).success,
    ).toBe(true);
    expect(
      AddShelfItemInputSchema.safeParse({
        workSlug: 's'.repeat(201),
      }).success,
    ).toBe(false);
  });
});
