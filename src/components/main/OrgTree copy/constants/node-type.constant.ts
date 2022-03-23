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
  [TreeTypeEnum.CHECKLIST]: {
    value: TreeTypeEnum.CHECKLIST,
    title: 'Checklist',
    name: 'Checklist',
    color: 'check',
    childOptions: [TreeTypeEnum.CATEGORY, TreeTypeEnum.QUESTION],
    placeholder: 'Nome do checklist...',
  },
  [TreeTypeEnum.CATEGORY]: {
    value: TreeTypeEnum.CATEGORY,
    title: 'Nova categoria',
    name: 'Categoria',
    color: 'category',
    childOptions: [TreeTypeEnum.GROUP, TreeTypeEnum.QUESTION],
    placeholder: 'Nome da categoria...',
  },
  [TreeTypeEnum.GROUP]: {
    value: TreeTypeEnum.GROUP,
    title: 'Novo Grupo',
    color: 'group',
    name: 'Grupo',
    childOptions: [TreeTypeEnum.QUESTION],
    placeholder: 'Nome do grupo...',
  },
  [TreeTypeEnum.QUESTION]: {
    value: TreeTypeEnum.QUESTION,
    title: 'Nova Pergunta',
    color: 'question',
    name: 'Pergunta',
    childOptions: [TreeTypeEnum.OPTION],
    placeholder: 'Descrição da pergunta...',
  },
  [TreeTypeEnum.OPTION]: {
    value: TreeTypeEnum.OPTION,
    color: 'option',
    title: 'Nova opção de resposta',
    name: 'Opção de resposta',
    childOptions: [TreeTypeEnum.QUESTION, TreeTypeEnum.GROUP],
    placeholder: 'Descrição da opção de resposta...',
  },
} as INodeTypes;
