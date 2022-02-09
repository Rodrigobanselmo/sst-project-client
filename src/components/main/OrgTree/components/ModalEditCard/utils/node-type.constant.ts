import { TreeTypeEnum } from '../../../../../../core/enums/tree-type.enums';

interface INodeTypes
  extends Record<
    TreeTypeEnum,
    {
      value: TreeTypeEnum;
      title: string;
      name: string;
      childOptions: TreeTypeEnum[];
      placeholder: string;
    }
  > {}

export const nodeTypesConstant = {
  [TreeTypeEnum.CHECKLIST]: {
    value: TreeTypeEnum.CHECKLIST,
    title: 'Checklist',
    name: 'Checklist',
    childOptions: [TreeTypeEnum.CATEGORY, TreeTypeEnum.QUESTION],
    placeholder: 'Nome do checklist...',
  },
  [TreeTypeEnum.CATEGORY]: {
    value: TreeTypeEnum.CATEGORY,
    title: 'Nova categoria',
    name: 'Categoria',
    childOptions: [TreeTypeEnum.GROUP, TreeTypeEnum.QUESTION],
    placeholder: 'Nome da categoria...',
  },
  [TreeTypeEnum.GROUP]: {
    value: TreeTypeEnum.GROUP,
    title: 'Novo Grupo',
    name: 'Grupo',
    childOptions: [TreeTypeEnum.QUESTION],
    placeholder: 'Nome do grupo...',
  },
  [TreeTypeEnum.QUESTION]: {
    value: TreeTypeEnum.QUESTION,
    title: 'Nova Pergunta',
    name: 'Pergunta',
    childOptions: [TreeTypeEnum.OPTION],
    placeholder: 'Descrição da pergunta...',
  },
  [TreeTypeEnum.OPTION]: {
    value: TreeTypeEnum.OPTION,
    title: 'Nova opção de resposta',
    name: 'Opção',
    childOptions: [TreeTypeEnum.QUESTION, TreeTypeEnum.GROUP],
    placeholder: 'Descrição da opção de pergunta...',
  },
} as INodeTypes;
