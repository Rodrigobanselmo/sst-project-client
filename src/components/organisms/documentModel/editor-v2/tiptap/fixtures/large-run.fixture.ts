import {
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
} from 'project/enum/document-model.enum';

export const LARGE_RUN_PARAGRAPH_COUNT = 100;

export function buildLargeDefinitionsRunModel(): IDocumentModelData {
  const bodyId = 'section-large-run';
  const children: IDocumentModelElement[] = [
    {
      id: 'el-large-h1',
      type: DocumentSectionChildrenTypeEnum.H1,
      text: 'DEFINIÇÕES',
    },
  ];

  for (let index = 1; index <= LARGE_RUN_PARAGRAPH_COUNT; index += 1) {
    children.push({
      id: `el-large-p-${index}`,
      type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
      text: `Parágrafo ${index} da sequência de definições. A empresa ??RAZAO_SOCIAL?? permanece no texto.`,
    });
  }

  children.push({
    id: 'el-large-table',
    type: DocumentSectionChildrenTypeEnum.TABLE_GSE,
    text: '',
  });

  children.push({
    id: 'el-large-tail',
    type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
    text: 'Parágrafo após a tabela dinâmica.',
  });

  return {
    variables: [{ type: 'RAZAO_SOCIAL', label: 'Empresa Exemplo LTDA' }],
    sections: [
      {
        data: [
          {
            id: bodyId,
            type: DocumentSectionTypeEnum.SECTION,
            hasChildren: true,
          },
        ],
        children: {
          [bodyId]: children,
        },
      },
    ],
  };
}
