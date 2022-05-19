import { TreeTypeEnum } from '../enums/tree-type.enums';

interface INodeTypes
  extends Record<
    TreeTypeEnum,
    {
      value: TreeTypeEnum;
      title: string;
      name: string;
      color: string;
      childOptions: TreeTypeEnum[];
      placeholder: string;
    }
  > {}

export const nodeTypesConstant = {
  [TreeTypeEnum.COMPANY]: {
    value: TreeTypeEnum.COMPANY,
    title: 'Empresa',
    name: 'Empresa',
    color: 'option',
    childOptions: [TreeTypeEnum.WORKSPACE],
    placeholder: 'Nome do empresa...',
  },
  [TreeTypeEnum.WORKSPACE]: {
    value: TreeTypeEnum.WORKSPACE,
    color: 'option',
    title: 'Unidade',
    name: 'Unidade',
    placeholder: 'Nome da unidade...',
    childOptions: [
      TreeTypeEnum.DIRECTORY,
      TreeTypeEnum.MANAGEMENT,
      TreeTypeEnum.SECTOR,
      TreeTypeEnum.OFFICE,
    ],
  },
  [TreeTypeEnum.DIRECTORY]: {
    value: TreeTypeEnum.DIRECTORY,
    title: 'Nova diretória',
    name: 'Diretória',
    color: 'check',
    placeholder: 'Nome da diretória...',
    childOptions: [
      TreeTypeEnum.MANAGEMENT,
      TreeTypeEnum.SECTOR,
      TreeTypeEnum.OFFICE,
    ],
  },
  [TreeTypeEnum.MANAGEMENT]: {
    value: TreeTypeEnum.MANAGEMENT,
    title: 'Nova gerência',
    name: 'Gerência',
    color: 'option',
    placeholder: 'Nome da gerência...',
    childOptions: [TreeTypeEnum.SECTOR, TreeTypeEnum.OFFICE],
  },
  [TreeTypeEnum.SECTOR]: {
    value: TreeTypeEnum.SECTOR,
    color: 'question',
    title: 'Novo setor',
    name: 'Setor',
    placeholder: 'Nome do setor...',
    childOptions: [TreeTypeEnum.SUB_SECTOR, TreeTypeEnum.OFFICE],
  },
  [TreeTypeEnum.SUB_SECTOR]: {
    value: TreeTypeEnum.SUB_SECTOR,
    color: 'group',
    title: 'Novo setor desenvolvido',
    name: 'Setor desenvolvido',
    childOptions: [TreeTypeEnum.OFFICE],
    placeholder: 'Nome do setor desenvolvido...',
  },
  [TreeTypeEnum.OFFICE]: {
    value: TreeTypeEnum.OFFICE,
    title: 'Novo cargo',
    color: 'category',
    name: 'Cargo',
    childOptions: [TreeTypeEnum.SUB_OFFICE],
    placeholder: 'Nome do cargo...',
  },
  [TreeTypeEnum.SUB_OFFICE]: {
    value: TreeTypeEnum.SUB_OFFICE,
    title: 'Novo cargo desenvolvido',
    color: 'group',
    name: 'Cargo desenvolvido',
    placeholder: 'Descrição do cargo desenvolvido...',
    childOptions: [] as TreeTypeEnum[],
  },
} as INodeTypes;