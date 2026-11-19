import { SIMPLESST_PRODUCT_YELLOW } from 'configs/theme/simplesst-product-identity';
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
    border: '#173E78',
    borderWidth: 2,
    background: '#EEF2F9',
    headerBg: '#173E78',
    headerColor: '#FFFFFF',
    accentLeft: '#173E78',
    shadow: '0 2px 8px rgba(23, 62, 120, 0.16)',
  },
  [TreeTypeEnum.ESTABLISHMENT_GROUP]: {
    border: '#4F83BD',
    borderWidth: 1.5,
    background: '#EDF4FB',
    headerBg: '#D7E7F7',
    headerColor: '#244F7C',
    accentLeft: '#4F83BD',
    shadow: '0 1px 6px rgba(79, 131, 189, 0.14)',
  },
  [TreeTypeEnum.WORKSPACE]: {
    border: '#9CC9EC',
    borderWidth: 1.5,
    background: '#F0F8FE',
    headerBg: '#DDEFFD',
    headerColor: '#244865',
    accentLeft: '#9CC9EC',
    shadow: '0 1px 6px rgba(156, 201, 236, 0.16)',
  },
  [TreeTypeEnum.DIRECTORY]: {
    border: SIMPLESST_PRODUCT_YELLOW,
    borderWidth: 2,
    background: '#FFFBEA',
    headerBg: '#FFF3BF',
    headerColor: '#665008',
    accentLeft: SIMPLESST_PRODUCT_YELLOW,
    shadow: '0 1px 6px rgba(246, 208, 64, 0.14)',
  },
  [TreeTypeEnum.MANAGEMENT]: {
    border: '#D9A85C',
    borderWidth: 1.5,
    background: '#FCF5E9',
    headerBg: '#F7E8CC',
    headerColor: '#70501D',
    accentLeft: '#D9A85C',
    shadow: '0 1px 6px rgba(217, 168, 92, 0.14)',
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
    border: '#83AD98',
    borderWidth: 1.5,
    background: '#F1F6F3',
    headerBg: '#E2EDE7',
    headerColor: '#3F6552',
    accentLeft: '#83AD98',
    shadow: '0 1px 6px rgba(131, 173, 152, 0.14)',
  },
  [TreeTypeEnum.OFFICE]: {
    border: '#EF705F',
    borderWidth: 2,
    background: '#FFF0ED',
    headerBg: '#FFE0D9',
    headerColor: '#913C30',
    accentLeft: '#EF705F',
    shadow: '0 2px 8px rgba(239, 112, 95, 0.20)',
  },
  [TreeTypeEnum.SUB_OFFICE]: {
    border: '#CC9A90',
    borderWidth: 1.5,
    background: '#FAF3F1',
    headerBg: '#F3E3DF',
    headerColor: '#785148',
    accentLeft: '#CC9A90',
    shadow: '0 1px 6px rgba(204, 154, 144, 0.14)',
  },
};

export const hierarchyLegendItems: {
  type: TreeTypeEnum;
  label: string;
}[] = [
  { type: TreeTypeEnum.COMPANY, label: 'Empresa' },
  { type: TreeTypeEnum.ESTABLISHMENT_GROUP, label: 'Grupo de estabelecimentos' },
  { type: TreeTypeEnum.WORKSPACE, label: 'Estabelecimento' },
  { type: TreeTypeEnum.DIRECTORY, label: 'Diretoria' },
  { type: TreeTypeEnum.MANAGEMENT, label: 'Gerência' },
  { type: TreeTypeEnum.SECTOR, label: 'Setor' },
  { type: TreeTypeEnum.SUB_SECTOR, label: 'Sub-setor' },
  { type: TreeTypeEnum.OFFICE, label: 'Cargo' },
  { type: TreeTypeEnum.SUB_OFFICE, label: 'Cargo desenvolvido' },
];

/** Keep level identity while matching card surfaces to the active theme. */
export function getHierarchyNodeVisual(type: TreeTypeEnum, mode: 'light' | 'dark') {
  const visual = hierarchyNodeVisualIdentity[type];
  if (!visual) return visual;
  if (mode === 'light') {
    const channels = visual.border.slice(1).match(/../g)!.map((value) => parseInt(value, 16));
    const opacity = type === TreeTypeEnum.OFFICE ? 0.11 : 0.07;
    return { ...visual, background: `rgba(${channels.join(', ')}, ${opacity})` };
  }
  const background = type === TreeTypeEnum.COMPANY ? '#1A263A'
    : type === TreeTypeEnum.ESTABLISHMENT_GROUP ? '#1D3047'
    : type === TreeTypeEnum.WORKSPACE ? '#223B50'
    : type === TreeTypeEnum.DIRECTORY ? '#37321D'
    : type === TreeTypeEnum.MANAGEMENT ? '#332B20'
    : type === TreeTypeEnum.SECTOR ? '#192F28'
    : type === TreeTypeEnum.SUB_SECTOR ? '#25312B'
      : type === TreeTypeEnum.OFFICE ? '#402924'
      : type === TreeTypeEnum.SUB_OFFICE ? '#352D2A' : '#252C38';
  return { ...visual, background };
}
