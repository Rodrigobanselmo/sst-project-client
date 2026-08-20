import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

const SIMPLE_CONTENT_ELEMENT_TYPES = new Set<DocumentSectionChildrenTypeEnum>([
  DocumentSectionChildrenTypeEnum.TITLE,
  DocumentSectionChildrenTypeEnum.H1,
  DocumentSectionChildrenTypeEnum.H2,
  DocumentSectionChildrenTypeEnum.H3,
  DocumentSectionChildrenTypeEnum.H4,
  DocumentSectionChildrenTypeEnum.H5,
  DocumentSectionChildrenTypeEnum.H6,
  DocumentSectionChildrenTypeEnum.PARAGRAPH,
  DocumentSectionChildrenTypeEnum.IMAGE,
  DocumentSectionChildrenTypeEnum.BREAK,
  DocumentSectionChildrenTypeEnum.SECTION_BREAK,
  DocumentSectionChildrenTypeEnum.BULLET,
  DocumentSectionChildrenTypeEnum.BULLET_SPACE,
  DocumentSectionChildrenTypeEnum.PARAGRAPH_TABLE,
  DocumentSectionChildrenTypeEnum.LEGEND,
  DocumentSectionChildrenTypeEnum.PARAGRAPH_FIGURE,
]);

export function isDynamicStructuralChildElement(
  type: string,
  meta: IDocumentModelFull['elements'][0],
) {
  if (meta?.active === false) return true;
  if (SIMPLE_CONTENT_ELEMENT_TYPES.has(type as DocumentSectionChildrenTypeEnum))
    return false;
  if (meta?.isParagraph || meta?.isBullet) return false;
  return true;
}

/** Blocos estruturais de data[] — respeita active; accept já vem filtrado pela API. */
export function filterInsertableStructuralSections(
  sections: IDocumentModelFull['sections'],
): IDocumentModelFull['sections'] {
  return Object.fromEntries(
    Object.entries(sections).filter(([, meta]) => meta?.active !== false),
  ) as IDocumentModelFull['sections'];
}

/** Elementos internos/de conteúdo (children[]) — exclui tabelas/blocos dinâmicos. */
export function filterInsertableContentElements(
  elements: IDocumentModelFull['elements'],
): IDocumentModelFull['elements'] {
  return Object.fromEntries(
    Object.entries(elements).filter(
      ([type, meta]) => !isDynamicStructuralChildElement(type, meta),
    ),
  ) as IDocumentModelFull['elements'];
}

export function getStructuralSectionDefaults(
  type: string,
  sectionsCatalog: IDocumentModelFull['sections'],
): { hasChildren?: boolean; text?: string } {
  const meta = sectionsCatalog[type];
  if (!meta) return {};

  return {
    ...(meta.isSection && { hasChildren: true }),
    ...(meta.text != null && meta.text !== '' && { text: meta.text }),
  };
}

export function hasInsertableStructuralCatalog(
  sections: IDocumentModelFull['sections'],
) {
  return Object.keys(filterInsertableStructuralSections(sections)).length > 0;
}

export function hasInsertableContentCatalog(
  elements: IDocumentModelFull['elements'],
) {
  return Object.keys(filterInsertableContentElements(elements)).length > 0;
}
