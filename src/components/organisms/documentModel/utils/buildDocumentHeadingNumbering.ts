/**
 * Visual-only heading numbering aligned with DOCX `heading-numbering`
 * (`%1.`, `%1.%2.`, … in document.ts). TITLE / CHAPTER / BREAK / body
 * elements are ignored. Numbers must never be written into element.text.
 */

export type HeadingNumberingEntry = {
  /** e.g. `17.3.` */
  number: string;
  /** e.g. `17.3. Sigilo e Proteção das Informações` */
  displayText: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

export type HeadingNumberingMap = Record<string, HeadingNumberingEntry>;

type NumberableElement = {
  id: string;
  type: string;
  text?: string | null;
};

type NumberableSectionGroup = {
  data: Array<{ id: string; type?: string }>;
  children?: Record<string, NumberableElement[] | undefined> | null;
};

const HEADING_LEVEL: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

function formatHeadingNumber(counters: number[], level: number): string {
  return `${counters.slice(0, level).join('.')}.`;
}

/**
 * Walks document sections in order and assigns continuous H1–H6 numbers
 * (same continuity as Word across PARTES). Anexos/TITLE do not increment.
 *
 * Defensive: if an H2/H3 appears before any H1, ancestor counters stay 0
 * (e.g. `0.1.`) so the UI never throws.
 */
export function buildDocumentHeadingNumbering(
  sectionGroups: NumberableSectionGroup[] | null | undefined,
): HeadingNumberingMap {
  const result: HeadingNumberingMap = {};
  if (!sectionGroups?.length) return result;

  const counters = [0, 0, 0, 0, 0, 0];

  for (const group of sectionGroups) {
    if (!group?.data?.length) continue;

    for (const sectionItem of group.data) {
      const children = group.children?.[sectionItem.id];
      if (!children?.length) continue;

      for (const element of children) {
        if (!element?.id || !element.type) continue;
        const level = HEADING_LEVEL[element.type];
        if (!level) continue;

        const index = level - 1;
        counters[index] += 1;
        for (let i = index + 1; i < counters.length; i += 1) {
          counters[i] = 0;
        }

        const number = formatHeadingNumber(counters, level);
        const text = (element.text ?? '').trim();
        result[element.id] = {
          number,
          displayText: text ? `${number} ${text}` : number,
          level,
        };
      }
    }
  }

  return result;
}

export function isDocumentHeadingType(type: string | undefined | null): boolean {
  return !!type && type in HEADING_LEVEL;
}
