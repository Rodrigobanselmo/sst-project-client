import { EffectivenessStatusEnum } from '@v2/models/security/enums/effectiveness-status.enum';

export const EffectivenessStatusTranslate: Record<
  EffectivenessStatusEnum,
  string
> = {
  [EffectivenessStatusEnum.NOT_EVALUATED]: 'Não avaliada',
  [EffectivenessStatusEnum.EFFECTIVE]: 'Eficaz',
  [EffectivenessStatusEnum.PARTIALLY_EFFECTIVE]: 'Parcialmente eficaz',
  [EffectivenessStatusEnum.INEFFECTIVE]: 'Ineficaz',
  [EffectivenessStatusEnum.NOT_APPLICABLE]: 'Não aplicável',
};
