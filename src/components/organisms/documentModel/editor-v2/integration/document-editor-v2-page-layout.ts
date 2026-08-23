/**
 * Fase 6A — page layout VISUAL do Editor V2.
 *
 * A4 e margens são convenção de interface, copiadas dos presets DOCX
 * (`sectionProperties` / `sectionLandscapeProperties` em
 * sst-project-api/.../docx/base/config/styles.ts). O gerador NÃO persiste
 * pgSz A4; a numeração aqui é LOCAL ao slice aberto.
 */

export type DocumentEditorV2ViewMode = 'web' | 'page';

export type VisualPageOrientation = 'portrait' | 'landscape';

export type VisualPageItemKind = 'content' | 'page-break' | 'section-break';

export type VisualPageItem = {
  kind: VisualPageItemKind;
  /** Só SECTION_BREAK: orientation do conteúdo DEPOIS do marker. */
  nextOrientation?: VisualPageOrientation | null;
};

export type VisualPageTrailingBreak =
  | { kind: 'page-break'; itemIndex: number }
  | {
      kind: 'section-break';
      itemIndex: number;
      orientation: VisualPageOrientation;
    };

export type VisualPage = {
  pageNumber: number;
  orientation: VisualPageOrientation;
  contentIndexes: number[];
  trailingBreak: VisualPageTrailingBreak | null;
};

export type VisualPageMarginMm = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type VisualPageSizeMm = {
  width: number;
  height: number;
};

/** A4 visual. Não é pgSz persistido. */
export const A4_PORTRAIT_MM: VisualPageSizeMm = { width: 210, height: 297 };
export const A4_LANDSCAPE_MM: VisualPageSizeMm = { width: 297, height: 210 };

/**
 * Retrato corpo: top/left/right 567 twips ≈ 10 mm; bottom 900 twips ≈ 15.875 mm.
 * Fonte: sectionProperties.page.margin no gerador DOCX.
 */
export const PORTRAIT_BODY_MARGIN_MM: VisualPageMarginMm = {
  top: 10,
  right: 10,
  bottom: 15.875,
  left: 10,
};

/**
 * Paisagem: 500 twips ≈ 8.819 mm em todos os lados.
 * Fonte: sectionLandscapeProperties.page.margin no gerador DOCX.
 */
export const LANDSCAPE_BODY_MARGIN_MM: VisualPageMarginMm = {
  top: 8.819,
  right: 8.819,
  bottom: 8.819,
  left: 8.819,
};

export const VISUAL_PAGE_NUMBER_HELP =
  'Numeração visual desta seção. O documento final pode apresentar paginação diferente.';

const TWIPS_PER_MM = 1440 / 25.4;

export function isDocumentEditorV2ViewMode(
  value: unknown,
): value is DocumentEditorV2ViewMode {
  return value === 'web' || value === 'page';
}

export function resolveDocumentEditorV2ViewMode(
  value: unknown,
): DocumentEditorV2ViewMode {
  return value === 'page' ? 'page' : 'web';
}

/** Trocar Web ↔ Página nunca suja o experimento. */
export function doesViewModeChangeMarkDirty(): boolean {
  return false;
}

export function visualPageSizeMm(
  orientation: VisualPageOrientation,
): VisualPageSizeMm {
  return orientation === 'landscape' ? A4_LANDSCAPE_MM : A4_PORTRAIT_MM;
}

export function normalizeVisualOrientation(
  value: unknown,
): VisualPageOrientation {
  return value === 'landscape' ? 'landscape' : 'portrait';
}

type SectionPageSource = {
  properties?: {
    page?: {
      size?: { orientation?: string };
      margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };
  };
} | null;

export function resolveSectionVisualOrientation(
  source?: SectionPageSource,
): VisualPageOrientation {
  return normalizeVisualOrientation(source?.properties?.page?.size?.orientation);
}

function looksLikeTwipMargins(margin: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}): boolean {
  const values = [margin.top, margin.right, margin.bottom, margin.left].filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );
  return values.length > 0 && values.every((value) => value >= 100);
}

function twipsToMm(twips: number): number {
  return twips / TWIPS_PER_MM;
}

export function resolveVisualPageMargins(
  orientation: VisualPageOrientation,
  source?: SectionPageSource,
): VisualPageMarginMm {
  const preset =
    orientation === 'landscape'
      ? LANDSCAPE_BODY_MARGIN_MM
      : PORTRAIT_BODY_MARGIN_MM;
  const custom = source?.properties?.page?.margin;
  if (!custom || !looksLikeTwipMargins(custom)) return preset;
  return {
    top: custom.top != null ? twipsToMm(custom.top) : preset.top,
    right: custom.right != null ? twipsToMm(custom.right) : preset.right,
    bottom: custom.bottom != null ? twipsToMm(custom.bottom) : preset.bottom,
    left: custom.left != null ? twipsToMm(custom.left) : preset.left,
  };
}

export function classifyVisualPageItem(args: {
  nodeType?: string;
  atomType?: string;
  orientation?: unknown;
}): VisualPageItem {
  if (args.nodeType === 'docAtom' || args.atomType) {
    if (args.atomType === 'BREAK') return { kind: 'page-break' };
    if (args.atomType === 'SECTION_BREAK') {
      return {
        kind: 'section-break',
        nextOrientation: normalizeVisualOrientation(args.orientation),
      };
    }
  }
  return { kind: 'content' };
}

/**
 * Fatia o slice em folhas visuais.
 * BREAK termina folha e preserva orientation.
 * SECTION_BREAK termina folha; orientation vale para o conteúdo seguinte.
 * Quebras sem conteúdo (início / consecutivas / fim) não fabricam folha vazia.
 */
export function splitItemsIntoVisualPages(
  items: VisualPageItem[],
  initialOrientation: VisualPageOrientation = 'portrait',
): VisualPage[] {
  const pages: VisualPage[] = [];
  let orientation = initialOrientation;
  let contentIndexes: number[] = [];

  const flush = (trailingBreak: VisualPageTrailingBreak | null) => {
    if (!contentIndexes.length) return;
    pages.push({
      pageNumber: pages.length + 1,
      orientation,
      contentIndexes,
      trailingBreak,
    });
    contentIndexes = [];
  };

  items.forEach((item, itemIndex) => {
    if (item.kind === 'content') {
      contentIndexes.push(itemIndex);
      return;
    }

    if (item.kind === 'page-break') {
      flush({ kind: 'page-break', itemIndex });
      return;
    }

    const nextOrientation = normalizeVisualOrientation(item.nextOrientation);
    flush({
      kind: 'section-break',
      itemIndex,
      orientation: nextOrientation,
    });
    orientation = nextOrientation;
  });

  flush(null);
  return pages;
}

export function visualPageOverflowsA4(args: {
  contentHeightMm: number;
  orientation: VisualPageOrientation;
  epsilonMm?: number;
}): boolean {
  const nominal = visualPageSizeMm(args.orientation).height;
  return args.contentHeightMm > nominal + (args.epsilonMm ?? 1);
}
