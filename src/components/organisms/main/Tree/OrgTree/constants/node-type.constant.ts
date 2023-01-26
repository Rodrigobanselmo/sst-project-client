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
      placeholderDesc: string;
      placeholderRealDesc: string;
    }
  > {}

export const nodeTypesConstant = {
  [TreeTypeEnum.COMPANY]: {
    value: TreeTypeEnum.COMPANY,
    title: 'Empresa',
    name: 'Empresa',
    color: 'option',
    childOptions: [TreeTypeEnum.WORKSPACE],
    placeholder: 'nome do empresa...',
  },
  [TreeTypeEnum.WORKSPACE]: {
    value: TreeTypeEnum.WORKSPACE,
    color: 'option',
    title: 'Estabelecimento',
    name: 'Estabelecimento',
    placeholder: 'nome da estabelecimento...',
    childOptions: [
      TreeTypeEnum.SECTOR,
      TreeTypeEnum.DIRECTORY,
      TreeTypeEnum.MANAGEMENT,
      // TreeTypeEnum.OFFICE,
    ],
  },
  [TreeTypeEnum.DIRECTORY]: {
    value: TreeTypeEnum.DIRECTORY,
    title: 'Nova diretória',
    name: 'Diretória',
    color: 'check',
    placeholderDesc: 'descrição da diretória...',
    placeholderRealDesc: 'descrição real (entrevista) da diretória...',
    placeholder: 'nome da diretória...',
    childOptions: [
      TreeTypeEnum.SECTOR,
      TreeTypeEnum.MANAGEMENT,
      // TreeTypeEnum.OFFICE,
    ],
  },
  [TreeTypeEnum.MANAGEMENT]: {
    value: TreeTypeEnum.MANAGEMENT,
    title: 'Nova gerência',
    name: 'Gerência',
    color: 'option',
    placeholderDesc: 'descrição da gerência...',
    placeholderRealDesc: 'descrição real (entrevista) da gerência...',
    placeholder: 'nome da gerência...',
    childOptions: [TreeTypeEnum.SECTOR],
  },
  [TreeTypeEnum.SECTOR]: {
    value: TreeTypeEnum.SECTOR,
    color: 'question',
    title: 'Novo setor',
    name: 'Setor',
    placeholderDesc: 'descrição do setor...',
    placeholderRealDesc: 'descrição real (entrevista) do setor...',
    placeholder: 'nome do setor...',
    childOptions: [TreeTypeEnum.OFFICE, TreeTypeEnum.SUB_SECTOR],
  },
  [TreeTypeEnum.SUB_SECTOR]: {
    value: TreeTypeEnum.SUB_SECTOR,
    color: 'group',
    title: 'Novo Sub-setor',
    name: 'Sub-setor',
    childOptions: [TreeTypeEnum.OFFICE],
    placeholderDesc: 'descrição do sub-setor...',
    placeholderRealDesc: 'descrição real (entrevista) do sub-setor...',
    placeholder: 'nome do sub-setor...',
  },
  [TreeTypeEnum.OFFICE]: {
    value: TreeTypeEnum.OFFICE,
    title: 'Novo cargo',
    color: 'category',
    name: 'Cargo',
    childOptions: [TreeTypeEnum.SUB_OFFICE],
    placeholderDesc: 'descrição do cargo...',
    placeholderRealDesc: 'descrição real (entrevista) do cargo...',
    placeholder: 'nome do cargo...',
  },
  [TreeTypeEnum.SUB_OFFICE]: {
    value: TreeTypeEnum.SUB_OFFICE,
    title: 'Novo cargo desenvolvido',
    color: 'group',
    name: 'Cargo desenvolvido',
    placeholderDesc:
      'descrição das atividades complementares do cargo desenvolvido...',
    // placeholderDesc: 'descrição do cargo desenvolvido...',
    placeholderRealDesc: 'descrição real (entrevista) do cargo desenvolvido...',
    placeholder: 'nome do cargo desenvolvido...',
    childOptions: [] as TreeTypeEnum[],
  },
} as INodeTypes;
