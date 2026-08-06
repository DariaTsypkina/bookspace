import { NeedsContext } from '@prisma/client';

export function isExtractEligible(needsContext: NeedsContext): boolean {
  return needsContext === NeedsContext.YES;
}
