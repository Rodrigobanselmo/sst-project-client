import { ContentState, EditorState } from 'draft-js';

/** Espaçamento padrão percebido (~350 twips no Word). */
export const DEFAULT_LINE_HEIGHT = 1.46;

export const LINE_HEIGHT_OPTIONS = [
  { label: '1', value: 1 },
  { label: '1,15', value: 1.15 },
  { label: '1,5', value: 1.5 },
  { label: '2', value: 2 },
] as const;

export const parseLineHeightData = (value: unknown): number | undefined => {
  if (value == null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
};

export const lineHeightToClass = (value: number): string =>
  `draft-lh-${String(value).replace('.', '_')}`;

export const getCurrentLineHeight = (
  editorState: EditorState,
): number | undefined => {
  const key = editorState.getSelection().getStartKey();
  const block = editorState.getCurrentContent().getBlockForKey(key);
  return parseLineHeightData(block.getData().get('lineHeight'));
};

export const setLineHeightOnBlocks = (
  editorState: EditorState,
  lineHeight: number | undefined,
): EditorState => {
  const selection = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  let blockMap = contentState.getBlockMap();
  let inRange = false;

  blockMap.forEach((block, key) => {
    if (key === startKey) inRange = true;
    if (inRange && block) {
      const data =
        lineHeight == null
          ? block.getData().delete('lineHeight')
          : block.getData().set('lineHeight', lineHeight);
      blockMap = (blockMap as any).set(key, block.set('data', data));
    }
    if (key === endKey) inRange = false;
  });

  const newContent = contentState.merge({
    blockMap,
  } as Partial<ContentState>);

  return EditorState.push(editorState, newContent as any, 'change-block-data');
};
