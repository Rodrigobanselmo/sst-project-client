import { TreeTypeEnum } from '../enums/tree-type.enums';

export interface IHierarchyNodeVisual {
  border: string;
  borderWidth: number;
  background: string;
  headerBg: string;
  headerColor: string;
  accentLeft?: string;
  shadow: string;
}

/**
 * Identidade visual discreta por nível hierárquico.
 * Intensidade e bordas — sem paleta excessivamente colorida.
 */
export const hierarchyNodeVisualIdentity: Record<
  TreeTypeEnum,
  IHierarchyNodeVisual
> = {
  [TreeTypeEnum.COMPANY]: {
    border: '#123e96',
    borderWidth: 2,
    background: '#F5F7FC',
    headerBg: '#123e96',
    headerColor: '#FFFFFF',
    accentLeft: '#123e96',
    shadow: '0 2px 8px rgba(18, 62, 150, 0.16)',
  },
  [TreeTypeEnum.WORKSPACE]: {
    border: '#2153b7',
    borderWidth: 1.5,
    background: '#FAFBFE',
    headerBg: '#2153b7',
    headerColor: '#FFFFFF',
    accentLeft: '#2153b7',
    shadow: '0 1px 6px rgba(33, 83, 183, 0.12)',
  },
  [TreeTypeEnum.DIRECTORY]: {
    border: '#7A9AD9',
    borderWidth: 1,
    background: '#FFFFFF',
    headerBg: '#EAF0FA',
    headerColor: '#1A3F8F',
    shadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  },
  [TreeTypeEnum.MANAGEMENT]: {
    border: '#8A97A8',
    borderWidth: 1,
    background: '#FFFFFF',
    headerBg: '#EEF1F5',
    headerColor: '#4A5568',
    shadow: '0 1px 5px rgba(0, 0, 0, 0.1)',
  },
  [TreeTypeEnum.SECTOR]: {
    border: '#3cbe7d',
    borderWidth: 2,
    background: '#F3FBF6',
    headerBg: '#E6F7EE',
    headerColor: '#1f7e4d',
    accentLeft: '#3cbe7d',
    shadow: '0 1px 6px rgba(60, 190, 125, 0.14)',
  },
  [TreeTypeEnum.SUB_SECTOR]: {
    border: '#8BC9A8',
    borderWidth: 1,
    background: '#F8FCFA',
    headerBg: '#F0F8F4',
    headerColor: '#3D7A5C',
    accentLeft: '#8BC9A8',
    shadow: '0 1px 5px rgba(0, 0, 0, 0.08)',
  },
  [TreeTypeEnum.OFFICE]: {
    border: '#F27329',
    borderWidth: 1.5,
    background: '#FFFFFF',
    headerBg: '#FFF3EB',
    headerColor: '#C45612',
    shadow: '0 2px 8px rgba(242, 115, 41, 0.14)',
  },
  [TreeTypeEnum.SUB_OFFICE]: {
    border: '#A0AEC0',
    borderWidth: 1,
    background: '#FFFFFF',
    headerBg: '#F7FAFC',
    headerColor: '#718096',
    shadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
};

export const hierarchyLegendItems: {
  type: TreeTypeEnum;
  label: string;
}[] = [
  { type: TreeTypeEnum.COMPANY, label: 'Empresa' },
  { type: TreeTypeEnum.WORKSPACE, label: 'Estabelecimento' },
  { type: TreeTypeEnum.DIRECTORY, label: 'Diretória' },
  { type: TreeTypeEnum.MANAGEMENT, label: 'Gerência' },
  { type: TreeTypeEnum.SECTOR, label: 'Setor' },
  { type: TreeTypeEnum.SUB_SECTOR, label: 'Sub-setor' },
  { type: TreeTypeEnum.OFFICE, label: 'Cargo' },
  { type: TreeTypeEnum.SUB_OFFICE, label: 'Cargo desenvolvido' },
];
