import { HirarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { CharacterizationColumnsEnum } from '../enums/characterization-columns.enum';
import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

type CharacterizationTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
};

export const CharacterizationColumnMap: Record<
  CharacterizationColumnsEnum,
  CharacterizationTypeMapValue
> = {
  [CharacterizationColumnsEnum.CHECK_BOX]: { label: '', alwaysVisible: true },
  [CharacterizationColumnsEnum.NAME]: { label: 'Nome', alwaysVisible: true },
  [CharacterizationColumnsEnum.TYPE]: { label: 'Tipo' },
  [CharacterizationColumnsEnum.PHOTOS]: { label: 'Fotos' },
  [CharacterizationColumnsEnum.CREATED_AT]: { label: 'Criação' },
  [CharacterizationColumnsEnum.UPDATED_AT]: { label: 'Ult. Edição' },
  [CharacterizationColumnsEnum.ORDER]: { label: 'Posição' },
  [CharacterizationColumnsEnum.RISKS]: { label: 'Riscos' },
  [CharacterizationColumnsEnum.HIERARCHY]: { label: 'Cargos' },
  [CharacterizationColumnsEnum.PROFILES]: { label: 'Perfis' },
  [CharacterizationColumnsEnum.STAGE]: { label: 'Status' },
};

export const characterizationColumns = Object.entries(CharacterizationColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label }]) => ({
    value,
    label,
  }));
