import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { CharacterizationColumnsEnum } from '../enums/characterization-columns.enum';
import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';

type CharacterizationTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  /** Oculta no estado inicial quando não há preferência salva para a coluna. */
  startHidden?: boolean;
};

export const CharacterizationColumnMap: Record<
  CharacterizationColumnsEnum,
  CharacterizationTypeMapValue
> = {
  [CharacterizationColumnsEnum.CHECK_BOX]: { label: '', alwaysVisible: true },
  [CharacterizationColumnsEnum.NAME]: { label: 'Nome', alwaysVisible: true },
  [CharacterizationColumnsEnum.TYPE]: { label: 'Tipo' },
  [CharacterizationColumnsEnum.PHOTOS]: { label: 'Fotos' },
  [CharacterizationColumnsEnum.CREATED_AT]: {
    label: 'Criação',
    startHidden: true,
  },
  [CharacterizationColumnsEnum.UPDATED_AT]: {
    label: 'Ult. Edição',
    startHidden: true,
  },
  [CharacterizationColumnsEnum.ORDER]: { label: 'Posição' },
  [CharacterizationColumnsEnum.RISKS]: { label: 'Riscos' },
  [CharacterizationColumnsEnum.HIERARCHY]: { label: 'Cargos' },
  [CharacterizationColumnsEnum.PROFILES]: { label: 'Perfis' },
  [CharacterizationColumnsEnum.TECHNICAL_CONTENT]: { label: 'Conteúdo Técnico' },
  [CharacterizationColumnsEnum.ENVIRONMENTAL_PARAMS]: {
    label: 'Parâmetros Ambientais',
  },
  [CharacterizationColumnsEnum.STAGE]: { label: 'Etapa' },
  [CharacterizationColumnsEnum.EDIT]: { label: 'Editar', alwaysVisible: true },
};

export const characterizationColumns = Object.entries(CharacterizationColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
