import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  CHEMICAL_SCENARIO_SCORES,
  type ChemicalScenarioRatingReview,
} from './chemical-prioritization';

/** Shared scenario data supersedes personal drafts, including explicit removal. */
export function restoreScenarioContacts<
  T extends {
    rows: ChemicalUseScenarioBoardRow[];
    ratingReviews: Partial<Record<string, ChemicalScenarioRatingReview>>;
    reviewed: boolean;
  },
>(analysis: T): T {
  const ratingReviews = { ...analysis.ratingReviews };
  let changed = false;
  for (const row of analysis.rows) {
    if ((row.contactScoreRevision ?? 0) === 0) continue;
    const contact = CHEMICAL_SCENARIO_SCORES.find(
      (score) => score === row.contactScore,
    );
    const previous = ratingReviews[row.id];
    if (
      previous?.ratings.contact !== contact ||
      previous?.confirmed !== Boolean(contact)
    )
      changed = true;
    ratingReviews[row.id] = {
      ratings: { contact },
      confirmed: Boolean(contact),
    };
  }
  return {
    ...analysis,
    ratingReviews,
    reviewed: changed ? false : analysis.reviewed,
  };
}
