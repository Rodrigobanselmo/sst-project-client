import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

import { DocumentAtom } from './document-atom';
import { DocumentBullet } from './document-bullet';
import { DocumentCaption } from './document-caption';
import { DocumentHeading } from './document-heading';
import { DocumentParagraph } from './document-paragraph';
import { DocumentStyle } from './document-style';
import { DocumentVariable } from './document-variable';
import {
  DocumentDoc,
  DocumentGroup,
  DocumentSection,
} from './document-structure';
import { createStructuralEditingExtension } from './structural-editing.extension';

const DocumentLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: { default: null },
      target: { default: '_blank' },
      targetOption: { default: '_blank' },
    };
  },
});

export function createDocumentEditorExtensions() {
  return [
    StarterKit.configure({
      document: false,
      heading: false,
      paragraph: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      strike: false,
      dropcursor: false,
      gapcursor: false,
    }),
    DocumentDoc,
    DocumentGroup,
    DocumentSection,
    DocumentHeading,
    DocumentParagraph,
    DocumentBullet,
    DocumentCaption,
    DocumentAtom,
    DocumentVariable,
    DocumentStyle,
    Underline,
    DocumentLink.configure({
      openOnClick: false,
      autolink: false,
      linkOnPaste: false,
    }),
    createStructuralEditingExtension(),
  ];
}
