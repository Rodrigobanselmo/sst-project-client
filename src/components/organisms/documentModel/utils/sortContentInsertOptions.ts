import { DocumentSectionChildrenTypeEnum } from 'project/enum/document-model.enum';

const EQUAL_ORDER_TYPE_PRIORITY: Partial<
  Record<DocumentSectionChildrenTypeEnum, number>
> = {
  [DocumentSectionChildrenTypeEnum.PARAGRAPH]: 0,
  [DocumentSectionChildrenTypeEnum.BULLET]: 1,
};

export function sortContentInsertOptions<
  T extends { type: string; order?: number; label?: string },
>(options: T[]): T[] {
  return [...options].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;

    const priorityA =
      EQUAL_ORDER_TYPE_PRIORITY[a.type as DocumentSectionChildrenTypeEnum] ??
      50;
    const priorityB =
      EQUAL_ORDER_TYPE_PRIORITY[b.type as DocumentSectionChildrenTypeEnum] ??
      50;
    if (priorityA !== priorityB) return priorityA - priorityB;

    return (a.label || '').localeCompare(b.label || '', 'pt');
  });
}
