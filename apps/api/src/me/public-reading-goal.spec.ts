import { toPublicReadingGoal } from './public-reading-goal';

describe('toPublicReadingGoal (bd-cq7.5)', () => {
  it('hides goal when showOnProfile is false or missing', () => {
    expect(
      toPublicReadingGoal({
        year: 2026,
        targetCount: 24,
        progressCount: 3,
        showOnProfile: false,
      }),
    ).toBeNull();
    expect(toPublicReadingGoal(null)).toBeNull();
    expect(toPublicReadingGoal(undefined)).toBeNull();
  });

  it('exposes goal only when showOnProfile is true', () => {
    expect(
      toPublicReadingGoal({
        year: 2026,
        targetCount: 24,
        progressCount: 3,
        showOnProfile: true,
      }),
    ).toEqual({
      year: 2026,
      targetCount: 24,
      progressCount: 3,
    });
  });
});
