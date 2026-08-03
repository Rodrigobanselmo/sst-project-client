import type { CharacterizationAiProfileSummaryDto } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

export type CharacterizationAiSpecialistSuggestionProfile = Pick<
  CharacterizationAiProfileSummaryDto,
  | 'id'
  | 'name'
  | 'category'
  | 'version'
  | 'isActive'
  | 'isCompanyDefault'
  | 'recommendedCharacterizationTypes'
>;

/**
 * Suggests an active specialist whose recommendedCharacterizationTypes include the element type.
 * Falls back to company default, then first active specialist.
 * Never silently invents a match — returns null when none available.
 */
export function suggestCharacterizationAiSpecialist(params: {
  characterizationType?: CharacterizationTypeEnum | string | null;
  profiles: CharacterizationAiSpecialistSuggestionProfile[];
}): CharacterizationAiSpecialistSuggestionProfile | null {
  const active = (params.profiles || []).filter((profile) => profile.isActive);
  if (!active.length) return null;

  const type = params.characterizationType;
  if (type) {
    const byRecommended = active.find((profile) =>
      (profile.recommendedCharacterizationTypes || []).includes(
        type as CharacterizationTypeEnum,
      ),
    );
    if (byRecommended) return byRecommended;
  }

  const companyDefault = active.find((profile) => profile.isCompanyDefault);
  if (companyDefault) return companyDefault;

  return active[0] ?? null;
}
