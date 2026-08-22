import { JSONContent } from '@tiptap/core';

import {
  DocumentEditorBlock,
  DocumentEditorState,
  TextRunParagraph,
  isAtomBlock,
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
      source: block.source,
    },
    content: paragraphTextToContent(block.text),
  };
}

function textRunParagraphToNode(paragraph: TextRunParagraph): JSONContent {
  return {
    type: 'docParagraph',
    attrs: {
      id: paragraph.id,
      align: paragraph.align ?? paragraph.source.align ?? null,
      size: paragraph.size ?? null,
      color: paragraph.color ?? null,
      lineHeight: paragraph.lineHeight ?? null,
      lineHeightBlock: paragraph.lineHeightBlock ?? null,
      source: paragraph.source,
    },
    content: paragraphTextToContent(
      paragraph.text,
      paragraph.inlineStyleRangeBlock,
      paragraph.entityRangeBlock,
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
