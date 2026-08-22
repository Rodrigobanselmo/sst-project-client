import {
  AtomBlock,
  BulletItem,
  BulletRunBlock,
  DocumentEditorBlock,
  HeadingBlock,
  TextRunBlock,
  TextRunParagraph,
  isDocumentEditorHeadingType,
} from '../adapter/document-editor-state.types';

export type FlatEditorNode =
  | { kind: 'paragraph'; paragraph: TextRunParagraph }
  | { kind: 'bullet'; bullet: BulletItem }
  | { kind: 'heading'; block: HeadingBlock }
  | { kind: 'atom'; block: AtomBlock };

export function groupFlatNodesToBlocks(
  nodes: FlatEditorNode[],
): DocumentEditorBlock[] {
  const blocks: DocumentEditorBlock[] = [];
  let paragraphBuffer: TextRunParagraph[] = [];
  let bulletBuffer: BulletItem[] = [];

  const flushTextRun = () => {
    if (!paragraphBuffer.length) return;
    const block: TextRunBlock = {
      kind: 'text-run',
      paragraphs: paragraphBuffer,
    };
    blocks.push(block);
    paragraphBuffer = [];
  };

  const flushBulletRun = () => {
    if (!bulletBuffer.length) return;
    const block: BulletRunBlock = {
      kind: 'bullet-run',
      bullets: bulletBuffer,
    };
    blocks.push(block);
    bulletBuffer = [];
  };

  nodes.forEach((node) => {
    if (node.kind === 'paragraph') {
      flushBulletRun();
      paragraphBuffer.push(node.paragraph);
      return;
    }
    if (node.kind === 'bullet') {
      flushTextRun();
      bulletBuffer.push(node.bullet);
      return;
    }
    flushTextRun();
    flushBulletRun();
    blocks.push(node.block);
  });

  flushTextRun();
  flushBulletRun();
  return blocks;
}

export function isHeadingType(type: string) {
  return isDocumentEditorHeadingType(type);
}
