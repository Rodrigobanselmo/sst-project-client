import {
  AtomBlock,
  DocumentEditorBlock,
  HeadingBlock,
  TextRunBlock,
  TextRunParagraph,
  isDocumentEditorHeadingType,
} from '../adapter/document-editor-state.types';

export type FlatEditorNode =
  | { kind: 'paragraph'; paragraph: TextRunParagraph }
  | { kind: 'heading'; block: HeadingBlock }
  | { kind: 'atom'; block: AtomBlock };

export function groupFlatNodesToBlocks(
  nodes: FlatEditorNode[],
): DocumentEditorBlock[] {
  const blocks: DocumentEditorBlock[] = [];
  let paragraphBuffer: TextRunParagraph[] = [];

  const flushTextRun = () => {
    if (!paragraphBuffer.length) return;
    const block: TextRunBlock = {
      kind: 'text-run',
      paragraphs: paragraphBuffer,
    };
    blocks.push(block);
    paragraphBuffer = [];
  };

  nodes.forEach((node) => {
    if (node.kind === 'paragraph') {
      paragraphBuffer.push(node.paragraph);
      return;
    }
    flushTextRun();
    blocks.push(node.block);
  });

  flushTextRun();
  return blocks;
}

export function isHeadingType(type: string) {
  return isDocumentEditorHeadingType(type);
}
