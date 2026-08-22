import { JSONContent } from '@tiptap/core';

import {
  DocumentEditorBlock,
  DocumentEditorState,
  BulletItem,
  TextRunParagraph,
  defaultBulletLevelForSource,
  isAtomBlock,
  isBulletRunBlock,
  isHeadingBlock,
  isTextRunBlock,
} from '../adapter/document-editor-state.types';
import { paragraphTextToContent } from './inline-ranges';

function headingToNode(
  block: Extract<DocumentEditorBlock, { kind: 'heading' }>,
): JSONContent {
  return {
    type: 'docHeading',
    attrs: {
      id: block.id,
      headingType: block.type,
      align: block.source.align ?? null,
      size: block.source.size ?? null,
      color: block.source.color ?? null,
      lineHeight: block.source.lineHeight ?? null,
      lineHeightBlock: block.source.lineHeightBlock ?? null,
      source: block.source,
    },
    content: paragraphTextToContent(
      block.text,
      block.source.inlineStyleRangeBlock,
      block.source.entityRangeBlock,
    ),
  };
}

function textRunParagraphToNode(paragraph: TextRunParagraph): JSONContent {
  return {
    type: 'docParagraph',
    attrs: {
      id: paragraph.id,
      align: paragraph.align ?? paragraph.source.align ?? null,
      size: paragraph.size ?? paragraph.source.size ?? null,
      color: paragraph.color ?? paragraph.source.color ?? null,
      lineHeight: paragraph.lineHeight ?? paragraph.source.lineHeight ?? null,
      lineHeightBlock:
        paragraph.lineHeightBlock ?? paragraph.source.lineHeightBlock ?? null,
      source: paragraph.source,
    },
    content: paragraphTextToContent(
      paragraph.text,
      paragraph.inlineStyleRangeBlock,
      paragraph.entityRangeBlock,
    ),
  };
}

function bulletToNode(bullet: BulletItem): JSONContent {
  return {
    type: 'docBullet',
    attrs: {
      id: bullet.id,
      level: bullet.level ?? defaultBulletLevelForSource(bullet.source),
      align: bullet.align ?? bullet.source.align ?? null,
      size: bullet.size ?? bullet.source.size ?? null,
      color: bullet.color ?? bullet.source.color ?? null,
      lineHeight: bullet.lineHeight ?? bullet.source.lineHeight ?? null,
      lineHeightBlock:
        bullet.lineHeightBlock ?? bullet.source.lineHeightBlock ?? null,
      source: bullet.source,
    },
    content: paragraphTextToContent(
      bullet.text,
      bullet.inlineStyleRangeBlock,
      bullet.entityRangeBlock,
    ),
  };
}

function atomToNode(
  block: Extract<DocumentEditorBlock, { kind: 'atom' }>,
): JSONContent {
  return {
    type: 'docAtom',
    attrs: {
      id: block.id,
      atomType: block.type,
      source: block.source,
    },
  };
}

function blocksToContent(blocks: DocumentEditorBlock[]): JSONContent[] {
  const content: JSONContent[] = [];

  blocks.forEach((block) => {
    if (isHeadingBlock(block)) {
      content.push(headingToNode(block));
      return;
    }
    if (isAtomBlock(block)) {
      content.push(atomToNode(block));
      return;
    }
    if (isTextRunBlock(block)) {
      block.paragraphs.forEach((paragraph) => {
        content.push(textRunParagraphToNode(paragraph));
      });
      return;
    }
    if (isBulletRunBlock(block)) {
      block.bullets.forEach((bullet) => {
        content.push(bulletToNode(bullet));
      });
    }
  });

  return content;
}

export function toTipTapState(state: DocumentEditorState): JSONContent {
  return {
    type: 'doc',
    attrs: {
      variables: state.variables,
    },
    content: state.groups.map((group) => ({
      type: 'docGroup',
      attrs: {
        label: group.label ?? null,
        hadChildrenMap: group.hadChildrenMap,
      },
      content: group.sections.map((section) => ({
        type: 'docSection',
        attrs: {
          id: section.id,
          type: section.type,
          childrenOrigin: section.childrenOrigin,
          source: section.source,
        },
        content: blocksToContent(section.blocks),
      })),
    })),
  };
}
