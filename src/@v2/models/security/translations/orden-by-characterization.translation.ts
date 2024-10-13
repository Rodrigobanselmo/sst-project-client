import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';

type OrderByTranslationMap = Record<CharacterizationOrderByEnum, string>;

export const ordenByCharacterizationTranslation: OrderByTranslationMap = {
  [CharacterizationOrderByEnum.CREATED_AT]: 'data de criação',
  [CharacterizationOrderByEnum.UPDATED_AT]: 'data de atualização',
  [CharacterizationOrderByEnum.NAME]: 'nome',
  [CharacterizationOrderByEnum.TYPE]: 'tipo',
  [CharacterizationOrderByEnum.PHOTOS]: 'fotos',
  [CharacterizationOrderByEnum.ORDER]: 'posição',
  [CharacterizationOrderByEnum.STAGE]: 'status',
  [CharacterizationOrderByEnum.DONE_AT]: 'data de Conclusão',
  [CharacterizationOrderByEnum.RISKS]: 'riscos',
  [CharacterizationOrderByEnum.HIERARCHY]: 'cargos',
  [CharacterizationOrderByEnum.PROFILES]: 'perfis',
};
