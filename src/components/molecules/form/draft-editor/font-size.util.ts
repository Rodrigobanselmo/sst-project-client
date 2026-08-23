import {
  ContentState,
  EditorState,
  Modifier,
  RichUtils,
  SelectionState,
} from 'draft-js';

export const FONT_SIZE_OPTIONS = [
  6, 7, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 24, 30, 36,
] as const;

export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number];

export const DRAFT_FONT_SIZE_MENU_ATTR = 'data-draft-font-size-menu';

export const toFontSizeStyle = (size: number): string => `fontsize-${size}`;

export const parseFontSizeStyle = (style: string): number | undefined => {
  if (!style.startsWith('fontsize-')) return undefined;
  const n = Number(style.slice('fontsize-'.length));
  return Number.isFinite(n) ? n : undefined;
};

const addFontSizeStyles = (
  styles: Set<string>,
  inline: { forEach: (fn: (s?: string) => void) => void },
) => {
  inline.forEach((style) => {
    if (style?.startsWith('fontsize-')) styles.add(style);
  });
};

export const isSelectionValidOnContent = (
  content: ContentState,
  selection: SelectionState,
): boolean => {
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const startBlock = content.getBlockForKey(startKey);
  const endBlock = content.getBlockForKey(endKey);
  if (!startBlock || !endBlock) return false;

  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  if (startOffset < 0 || startOffset > startBlock.getLength()) return false;
  if (endOffset < 0 || endOffset > endBlock.getLength()) return false;
  return true;
};

export const resolveApplySelection = (
  live: SelectionState,
  saved?: SelectionState | null,
): SelectionState => {
  if (!live.isCollapsed()) return live;
  if (saved && !saved.isCollapsed()) return saved;
  return live;
};

export const resolveValidApplySelection = (
  content: ContentState,
  live: SelectionState,
  saved?: SelectionState | null,
): SelectionState | null => {
  if (!live.isCollapsed() && isSelectionValidOnContent(content, live)) {
    return live;
  }
  if (
    saved &&
    !saved.isCollapsed() &&
    isSelectionValidOnContent(content, saved)
  ) {
    return saved;
  }
  if (isSelectionValidOnContent(content, live)) return live;
  return null;
};

const collectFontSizeStylesInSelection = (
  editorState: EditorState,
  selection: SelectionState,
): string[] => {
  const styles = new Set<string>();
  const content = editorState.getCurrentContent();
  if (!isSelectionValidOnContent(content, selection)) return [];

  if (selection.isCollapsed()) {
    addFontSizeStyles(styles, editorState.getCurrentInlineStyle());
    return [...styles];
  }

  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  let inRange = false;

  content.getBlockMap().forEach((block, key) => {
    if (key === startKey) inRange = true;
    if (inRange && block) {
      const from = key === startKey ? startOffset : 0;
      const to = key === endKey ? endOffset : block.getLength();
      for (let i = from; i < to; i += 1) {
        addFontSizeStyles(styles, block.getInlineStyleAt(i));
      }
    }
    if (key === endKey) inRange = false;
  });

  return [...styles];
};

const fontSizesInSelection = (
  editorState: EditorState,
  selection: SelectionState,
): Array<number | undefined> => {
  const content = editorState.getCurrentContent();
  if (!isSelectionValidOnContent(content, selection)) return [];

  if (selection.isCollapsed()) {
    const fromOverride = editorState
      .getCurrentInlineStyle()
      .toArray()
      .map((style) => parseFontSizeStyle(style))
      .find((size) => size != null);
    return [fromOverride];
  }

  const sizes: Array<number | undefined> = [];
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();
  let inRange = false;

  content.getBlockMap().forEach((block, key) => {
    if (key === startKey) inRange = true;
    if (inRange && block) {
      const from = key === startKey ? startOffset : 0;
      const to = key === endKey ? endOffset : block.getLength();
      for (let i = from; i < to; i += 1) {
        const found = block
          .getInlineStyleAt(i)
          .toArray()
          .map((style) => parseFontSizeStyle(style))
          .find((size) => size != null);
        sizes.push(found);
      }
    }
    if (key === endKey) inRange = false;
  });

  return sizes;
};

export const getCurrentFontSize = (
  editorState: EditorState,
  selection: SelectionState = editorState.getSelection(),
): number | undefined => {
  const sizes = fontSizesInSelection(editorState, selection);
  if (sizes.length === 0) return undefined;
  const first = sizes[0];
  if (first == null) return undefined;
  return sizes.every((size) => size === first) ? first : undefined;
};

export const setSelectionFontSize = (
  editorState: EditorState,
  size: number,
  selection: SelectionState = editorState.getSelection(),
): EditorState => {
  const contentBefore = editorState.getCurrentContent();
  if (!isSelectionValidOnContent(contentBefore, selection)) {
    return editorState;
  }

  const styleName = toFontSizeStyle(size);
  const withSelection = EditorState.forceSelection(editorState, selection);
  const toRemove = collectFontSizeStylesInSelection(withSelection, selection);

  let content = withSelection.getCurrentContent();
  toRemove.forEach((style) => {
    if (!isSelectionValidOnContent(content, selection)) return;
    content = Modifier.removeInlineStyle(content, selection, style);
  });

  if (!selection.isCollapsed()) {
    if (!isSelectionValidOnContent(content, selection)) return editorState;
    content = Modifier.applyInlineStyle(content, selection, styleName);
    return EditorState.forceSelection(
      EditorState.push(withSelection, content, 'change-inline-style'),
      selection,
    );
  }

  let next = EditorState.forceSelection(
    EditorState.push(withSelection, content, 'change-inline-style'),
    selection,
  );
  if (!next.getCurrentInlineStyle().has(styleName)) {
    next = RichUtils.toggleInlineStyle(next, styleName);
  }
  return next;
};
