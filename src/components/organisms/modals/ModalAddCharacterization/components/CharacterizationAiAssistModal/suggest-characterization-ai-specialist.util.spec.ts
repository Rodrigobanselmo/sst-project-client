import { suggestCharacterizationAiSpecialist } from './suggest-characterization-ai-specialist.util';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

describe('suggestCharacterizationAiSpecialist', () => {
  const profiles = [
    {
      id: 'general',
      isActive: true,
      isCompanyDefault: true,
      recommendedCharacterizationTypes: [CharacterizationTypeEnum.GENERAL],
      name: 'Geral',
    },
    {
      id: 'aep',
      isActive: true,
      isCompanyDefault: false,
      recommendedCharacterizationTypes: [CharacterizationTypeEnum.WORKSTATION],
      name: 'AEP',
    },
    {
      id: 'inactive',
      isActive: false,
      isCompanyDefault: false,
      recommendedCharacterizationTypes: [CharacterizationTypeEnum.WORKSTATION],
      name: 'Inativo',
    },
  ] as any;

  it('prefers specialist recommended for the element type', () => {
    const suggested = suggestCharacterizationAiSpecialist({
      characterizationType: CharacterizationTypeEnum.WORKSTATION,
      profiles,
    });
    expect(suggested?.id).toBe('aep');
  });

  it('falls back to company default when no type match', () => {
    const suggested = suggestCharacterizationAiSpecialist({
      characterizationType: CharacterizationTypeEnum.EQUIPMENT,
      profiles,
    });
    expect(suggested?.id).toBe('general');
  });

  it('ignores inactive specialists', () => {
    const suggested = suggestCharacterizationAiSpecialist({
      characterizationType: CharacterizationTypeEnum.WORKSTATION,
      profiles: [profiles[2], profiles[0]],
    });
    expect(suggested?.id).toBe('general');
  });
});
