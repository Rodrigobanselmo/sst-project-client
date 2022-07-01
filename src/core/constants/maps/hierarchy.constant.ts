import { HierarchyEnum } from 'core/enums/hierarchy.enum';

interface INodeTypes
  extends Record<
    HierarchyEnum,
    {
      value: HierarchyEnum;
      title: string;
      name: string;
      color: string;
      childOptions: HierarchyEnum[];
      placeholder: string;
    }
  > {}

export const hierarchyConstant = {
  [HierarchyEnum.DIRECTORY]: {
    value: HierarchyEnum.DIRECTORY,
    title: 'Nova diretória',
    name: 'Diretória',
    color: 'check',
    placeholder: 'Nome da diretória...',
    childOptions: [
      HierarchyEnum.MANAGEMENT,
      HierarchyEnum.SECTOR,
      HierarchyEnum.OFFICE,
    ],
  },
  [HierarchyEnum.MANAGEMENT]: {
    value: HierarchyEnum.MANAGEMENT,
    title: 'Nova gerência',
    name: 'Gerência',
    color: 'option',
    placeholder: 'Nome da gerência...',
    childOptions: [HierarchyEnum.SECTOR, HierarchyEnum.OFFICE],
  },
  [HierarchyEnum.SECTOR]: {
    value: HierarchyEnum.SECTOR,
    color: 'question',
    title: 'Novo setor',
    name: 'Setor',
    placeholder: 'Nome do setor...',
    childOptions: [HierarchyEnum.SUB_SECTOR, HierarchyEnum.OFFICE],
  },
  [HierarchyEnum.SUB_SECTOR]: {
    value: HierarchyEnum.SUB_SECTOR,
    color: 'group',
    title: 'Novo Sub-setor',
    name: 'Sub-setor',
    childOptions: [HierarchyEnum.OFFICE],
    placeholder: 'Nome do sub-setor...',
  },
  [HierarchyEnum.OFFICE]: {
    value: HierarchyEnum.OFFICE,
    title: 'Novo cargo',
    color: 'category',
    name: 'Cargo',
    childOptions: [HierarchyEnum.SUB_OFFICE],
    placeholder: 'Nome do cargo...',
  },
  [HierarchyEnum.SUB_OFFICE]: {
    value: HierarchyEnum.SUB_OFFICE,
    title: 'Novo cargo desenvolvido',
    color: 'group',
    name: 'Cargo desenvolvido',
    placeholder: 'Descrição do cargo desenvolvido...',
    childOptions: [] as HierarchyEnum[],
  },
} as INodeTypes;

export const hierarchyList = [
  hierarchyConstant[HierarchyEnum.DIRECTORY],
  hierarchyConstant[HierarchyEnum.MANAGEMENT],
  hierarchyConstant[HierarchyEnum.SECTOR],
  hierarchyConstant[HierarchyEnum.SUB_SECTOR],
  hierarchyConstant[HierarchyEnum.OFFICE],
  hierarchyConstant[HierarchyEnum.SUB_OFFICE],
];
