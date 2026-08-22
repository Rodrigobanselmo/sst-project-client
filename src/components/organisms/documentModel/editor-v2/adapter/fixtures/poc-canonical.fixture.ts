import {
  DocModelAlignmentType,
  DocModelPageOrientation,
  IDocumentModelData,
  IDocumentModelElement,
} from 'core/interfaces/api/IDocumentModel';
import {
  DocumentSectionChildrenTypeEnum,
  DocumentSectionTypeEnum,
  InlineStyleTypeEnum,
} from 'project/enum/document-model.enum';

const paragraph = (
  id: string,
  text: string,
  extra?: Partial<IDocumentModelElement>,
): IDocumentModelElement => ({
  id,
  type: DocumentSectionChildrenTypeEnum.PARAGRAPH,
  text,
  ...extra,
});

/**
 * Recorte canônico no formato persistido pelo editor V1
 * (`data[]` + `children[sectionId]`), equivalente ao caso:
 * H2 + PARAGRAPH* + BULLET + IMAGE.
 */
export function buildPocCanonicalModel(): IDocumentModelData {
  const bodyId = 'section-body';

  return {
    variables: [
      { type: 'TITULO_DO_DOCUMENTO', label: 'PGR — POC Adapter' },
      { type: 'RAZAO_SOCIAL', label: 'Empresa Exemplo LTDA' },
    ],
    sections: [
      {
        data: [
          { id: 'section-cover', type: DocumentSectionTypeEnum.COVER },
          { id: 'section-toc', type: DocumentSectionTypeEnum.TOC },
          {
            id: 'section-chapter',
            type: DocumentSectionTypeEnum.CHAPTER,
            text: '??TITULO_DO_DOCUMENTO??',
          },
          {
            id: bodyId,
            type: DocumentSectionTypeEnum.SECTION,
            footerText: '??TITULO_DO_DOCUMENTO??',
            hasChildren: true,
          },
        ],
        children: {
          [bodyId]: [
            {
              id: 'el-h2',
              type: DocumentSectionChildrenTypeEnum.H2,
              text: 'Definições',
            },
            paragraph(
              'el-p-a',
              'Qualquer discussão sobre Riscos deve ser precedida de uma explicação da terminologia.',
            ),
            paragraph(
              'el-p-b',
              'Ação Corretiva: ação para eliminar a causa de uma não conformidade identificada.',
              {
                align: DocModelAlignmentType.BOTH,
                lineHeight: 1.46,
                inlineStyleRangeBlock: [
                  [
                    {
                      offset: 0,
                      length: 16,
                      style: InlineStyleTypeEnum.BOLD,
                    },
                  ],
                ],
              },
            ),
            paragraph(
              'el-p-c',
              'A empresa ??RAZAO_SOCIAL?? é a tomadora do serviço.',
              {
                removeWithSomeEmptyVars: ['RAZAO_SOCIAL'],
              },
            ),
            {
              id: 'el-bullet',
              type: DocumentSectionChildrenTypeEnum.BULLET,
              text: 'cortes, queimaduras, torções',
              level: 0,
            },
            paragraph('el-p-d', 'Parágrafo após o marcador.'),
            {
              id: 'el-image',
              type: DocumentSectionChildrenTypeEnum.IMAGE,
              text: '',
              url: '/images/placeholder-image.png',
              width: 100,
            },
            paragraph('el-p-e', 'Parágrafo após a imagem.'),
            {
              id: 'el-break',
              type: DocumentSectionChildrenTypeEnum.SECTION_BREAK,
              text: '',
              orientation: DocModelPageOrientation.LANDSCAPE,
            },
            paragraph('el-p-f', 'Parágrafo após a quebra de seção.'),
          ],
        },
      },
    ],
  };
}

/** Sequência longa de PARAGRAPH — o caso UX que motivou a superfície textual. */
export function buildDefinitionsExcerptModel(): IDocumentModelData {
  const bodyId = 'section-definitions';
  const headingsAndParagraphs: IDocumentModelElement[] = [
    {
      id: 'el-h1',
      type: DocumentSectionChildrenTypeEnum.H1,
      text: 'DEFINIÇÕES',
    },
    paragraph(
      'el-def-1',
      'Qualquer discussão sobre Riscos deve ser precedida de uma explicação da terminologia, seu sentido preciso e inter-relacionamentos.',
    ),
    paragraph(
      'el-def-2',
      'Ação Corretiva: Ação para eliminar a causa de uma não conformidade identificada ou outra situação indesejável.',
    ),
    paragraph(
      'el-def-3',
      'Ação Preventiva: Ação para eliminar a causa de um potencial não conformidade.',
    ),
    paragraph(
      'el-def-4',
      'Acidente do Trabalho: ocorrências de menor frequência, em geral restritas a uma pessoa.',
    ),
    paragraph(
      'el-def-5',
      'Agente Físico: qualquer forma de energia capaz de causar lesão ou agravo à saúde do trabalhador.',
    ),
    paragraph(
      'el-def-6',
      'Agente Químico: substância química capaz de causar lesão ou agravo à saúde do trabalhador.',
    ),
    paragraph('el-def-7', 'CIPA: Comissão Interna de Prevenção de Acidentes.'),
    paragraph(
      'el-def-8',
      'CNAE: Classificação Nacional de Atividades Econômicas. Ver www.mte.gov.br.',
      {
        entityRangeBlock: [
          [
            {
              offset: 55,
              length: 14,
              data: {
                type: 'LINK',
                mutability: 'MUTABLE',
                data: {
                  url: 'http://www.mte.gov.br',
                  targetOption: '_blank',
                },
              },
            },
          ],
        ],
      },
    ),
  ];

  return {
    variables: [{ type: 'CHAPTER_1', label: 'PARTE 01' }],
    sections: [
      {
        data: [
          {
            id: bodyId,
            type: DocumentSectionTypeEnum.SECTION,
            footerText: '??CHAPTER_1??',
            hasChildren: true,
          },
        ],
        children: {
          [bodyId]: headingsAndParagraphs,
        },
      },
    ],
  };
}

/** Modelo vazio no formato do create: COVER + TOC, sem `children`. */
export function buildEmptyCreateModel(): IDocumentModelData {
  return {
    variables: [],
    sections: [
      {
        data: [
          { id: 'cover-new', type: DocumentSectionTypeEnum.COVER },
          { id: 'toc-new', type: DocumentSectionTypeEnum.TOC },
        ],
      },
    ],
  };
}

/** Legado: children inline no nó SECTION (mocks PGR). */
export function buildInlineChildrenModel(): IDocumentModelData {
  return {
    variables: [{ type: 'TITULO_DO_DOCUMENTO', label: 'Inline' }],
    sections: [
      {
        data: [
          {
            id: 'section-inline',
            type: DocumentSectionTypeEnum.SECTION,
            footerText: 'rodapé',
            children: [
              {
                id: 'el-h2-inline',
                type: DocumentSectionChildrenTypeEnum.H2,
                text: 'Título inline',
              },
              paragraph('el-p-inline-a', 'Primeiro parágrafo inline.'),
              paragraph('el-p-inline-b', 'Segundo parágrafo inline.'),
            ],
          },
        ],
      },
    ],
  };
}
