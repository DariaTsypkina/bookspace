import type { PublicReadingGoal } from '@bookspace/schemas';

/** Сырая цель до гейта showOnProfile (модель ReadingGoal — bd-sf4). */
export type ReadingGoalCandidate = {
  year: number;
  targetCount: number;
  progressCount: number;
  showOnProfile: boolean;
};

/**
 * Цель на публичном профиле только при showOnProfile=true.
 * Иначе null (скрыта без тумблера).
 */
export function toPublicReadingGoal(
  goal: ReadingGoalCandidate | null | undefined,
): PublicReadingGoal | null {
  if (!goal || !goal.showOnProfile) {
    return null;
  }
  return {
    year: goal.year,
    targetCount: goal.targetCount,
    progressCount: goal.progressCount,
  };
}
