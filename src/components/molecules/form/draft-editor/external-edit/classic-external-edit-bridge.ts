import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
} from 'draft-js';

import {
  collectVisibleText,
  diffCommonAffix,
  logDocumentEditorExternalMutation,
  mergeExternalTextWithProtectedRanges,
  normalizeExternalEditableText,
  ProtectedTextRange,
} from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';

export type ClassicBlockDomText = {
  blockKey: string;
  text: string;
};

export type ClassicReconcileResult = {
  editorState: EditorState;
  changed: boolean;
  blockIds: string[];
};

function collectProtectedEntityRanges(
  block: ContentBlock,
  contentState: ReturnType<EditorState['getCurrentContent']>,
): ProtectedTextRange[] {
  const ranges: ProtectedTextRange[] = [];
  const text = block.getText();
  block.findEntityRanges(
    (char: CharacterMetadata) => Boolean(char.getEntity()),
    (start, end) => {
      const entityKey = block.getEntityAt(start);
      if (!entityKey) return;
      const entity = contentState.getEntity(entityKey);
      if (entity.getMutability() !== 'IMMUTABLE' && entity.getType() !== 'MENTION') {
        return;
      }
      ranges.push({
        start,
        end,
        text: text.slice(start, end),
      });
    },
  );
  return ranges;
}

type CharList = ReturnType<ContentBlock['getCharacterList']>;

function isHomogeneousCharacterRange(chars: CharList): boolean {
  if (chars.size <= 1) return true;
  const first = chars.get(0);
  if (!first) return true;
  const style = first.getStyle();
  const entity = first.getEntity();
  return chars.every((char) => {
    if (!char) return false;
    return char.getStyle().equals(style) && char.getEntity() === entity;
  });
}

function repeatCharacterMetadata(
  template: CharacterMetadata,
  count: number,
  empty: CharList,
): CharList {
  let list: CharList = empty;
  for (let i = 0; i < count; i += 1) {
    list = list.push(template) as CharList;
  }
  return list;
}

function buildMidCharacterList(args: {
  chars: CharList;
  replaceStart: number;
  replaceEnd: number;
  insertionLength: number;
}): CharList {
  const empty = args.chars.slice(0, 0) as CharList;
  const mid = args.chars.slice(args.replaceStart, args.replaceEnd) as CharList;

  if (args.insertionLength === 0) return empty;

  if (mid.size === 0) {
    const inherit =
      args.replaceStart > 0 ? args.chars.get(args.replaceStart - 1) : null;
    return repeatCharacterMetadata(
      inherit || CharacterMetadata.create(),
      args.insertionLength,
      empty,
    );
  }

  if (isHomogeneousCharacterRange(mid)) {
    return repeatCharacterMetadata(
      mid.get(0) || CharacterMetadata.create(),
      args.insertionLength,
      empty,
    );
  }

  if (mid.size === args.insertionLength) {
    return mid;
  }

  const mapped = Math.min(mid.size, args.insertionLength);
  let next = mid.slice(0, mapped) as CharList;
  if (args.insertionLength > mapped) {
    next = next.concat(
      repeatCharacterMetadata(
        CharacterMetadata.create(),
        args.insertionLength - mapped,
        empty,
      ),
    ) as CharList;
  }
  return next;
}

function replaceBlockTextPreservingRuns(
  content: ContentState,
  block: ContentBlock,
  nextText: string,
  replaceStart: number,
  replaceEnd: number,
  insertion: string,
): ContentState {
  const chars = block.getCharacterList();
  const nextChars = chars
    .slice(0, replaceStart)
    .concat(
      buildMidCharacterList({
        chars,
        replaceStart,
        replaceEnd,
        insertionLength: insertion.length,
      }),
    )
    .concat(chars.slice(replaceEnd)) as CharList;

  if (nextChars.size !== nextText.length) {
    return content;
  }

  const nextBlock = block.merge({
    text: nextText,
    characterList: nextChars,
  }) as ContentBlock;

  return content.merge({
    blockMap: content.getBlockMap().set(block.getKey(), nextBlock),
  }) as ContentState;
}

export function reconcileDraftBlockText(args: {
  editorState: EditorState;
  blockKey: string;
  nextText: string;
}): EditorState | null {
  const content = args.editorState.getCurrentContent();
  const block = content.getBlockForKey(args.blockKey);
  if (!block) return null;

  const before = block.getText();
  const merged = mergeExternalTextWithProtectedRanges(
    before,
    normalizeExternalEditableText(args.nextText),
    collectProtectedEntityRanges(block, content),
  );
  const after = merged.text;
  if (after === before) return null;

  const { prefix, suffix } = diffCommonAffix(before, after);
  const replaceStart = prefix;
  const replaceEnd = before.length - suffix;
  const insertion = after.slice(prefix, after.length - suffix);

  const nextContent = replaceBlockTextPreservingRuns(
    content,
    block,
    after,
    replaceStart,
    replaceEnd,
    insertion,
  );

  let next = EditorState.push(
    args.editorState,
    nextContent,
    'insert-characters',
  );

  const caret = Math.min(prefix + insertion.length, after.length);
  const caretSelection = SelectionState.createEmpty(args.blockKey).merge({
    anchorOffset: caret,
    focusOffset: caret,
    hasFocus: args.editorState.getSelection().getHasFocus(),
  }) as SelectionState;
  next = EditorState.forceSelection(next, caretSelection);

  logDocumentEditorExternalMutation({
    editor: 'classic',
    blockId: args.blockKey,
    charsBefore: before.length,
    charsAfter: after.length,
    reconciled: true,
  });

  return next;
}

export function reconcileDraftFromBlockTexts(
  editorState: EditorState,
  blocks: ClassicBlockDomText[],
): ClassicReconcileResult {
  let current = editorState;
  const blockIds: string[] = [];
  for (const block of blocks) {
    const next = reconcileDraftBlockText({
      editorState: current,
      blockKey: block.blockKey,
      nextText: block.text,
    });
    if (!next) continue;
    current = next;
    blockIds.push(block.blockKey);
  }
  return {
    editorState: current,
    changed: blockIds.length > 0,
    blockIds,
  };
}

export function readDraftBlockDomText(blockEl: {
  nodeType?: number;
  childNodes?: ArrayLike<unknown>;
  getAttribute?: (name: string) => string | null;
}): string {
  return collectVisibleText(blockEl);
}
