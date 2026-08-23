import { Editor, Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

import {
  DocumentEditorV2ViewMode,
  VISUAL_PAGE_NUMBER_HELP,
  classifyVisualPageItem,
  resolveSectionVisualOrientation,
  resolveVisualPageMargins,
  splitItemsIntoVisualPages,
  visualPageOverflowsA4,
  visualPageSizeMm,
  type VisualPageItem,
} from '../../integration/document-editor-v2-page-layout';

export const documentEditorV2PageLayoutKey = new PluginKey(
  'documentEditorV2PageLayout',
);

const MM_PER_PX = 25.4 / 96;

type ChildRef = {
  node: ProseMirrorNode;
  pos: number;
};

function sectionChildren(section: ProseMirrorNode, sectionPos: number): ChildRef[] {
  const children: ChildRef[] = [];
  section.forEach((child, offset) => {
    children.push({ node: child, pos: sectionPos + 1 + offset });
  });
  return children;
}

function toItems(children: ChildRef[]): VisualPageItem[] {
  return children.map(({ node }) =>
    classifyVisualPageItem({
      nodeType: node.type.name,
      atomType: node.attrs?.atomType,
      orientation: node.attrs?.source?.orientation,
    }),
  );
}

function createSheet(pageNumber: number, orientation: string) {
  const root = document.createElement('div');
  root.className = 'doc-editor-v2-page-sheet';
  root.dataset.visualPage = String(pageNumber);
  root.dataset.pageOrientation = orientation;
  root.setAttribute('contenteditable', 'false');
  return root;
}

function createChrome(pageNumber: number, orientation: string) {
  const root = document.createElement('div');
  root.className = 'doc-editor-v2-page-chrome';
  root.dataset.visualPage = String(pageNumber);
  root.dataset.pageOrientation = orientation;
  root.setAttribute('contenteditable', 'false');

  const number = document.createElement('span');
  number.className = 'doc-editor-v2-page-number';
  number.title = VISUAL_PAGE_NUMBER_HELP;
  number.textContent = `Página ${pageNumber}`;
  root.appendChild(number);

  const overflow = document.createElement('span');
  overflow.className = 'doc-editor-v2-page-overflow';
  overflow.hidden = true;
  overflow.textContent = 'Conteúdo excede a altura visual de A4';
  root.appendChild(overflow);

  return root;
}

function createSpacer(pageNumber: number, orientation: string) {
  const root = document.createElement('div');
  root.className = 'doc-editor-v2-page-spacer';
  root.dataset.visualPage = String(pageNumber);
  root.dataset.pageOrientation = orientation;
  root.setAttribute('contenteditable', 'false');
  return root;
}

function buildPageDecorations(state: EditorState, viewMode: DocumentEditorV2ViewMode) {
  if (viewMode !== 'page') return DecorationSet.empty;

  const decorations: Decoration[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'docSection') return true;
    const children = sectionChildren(node, pos);
    if (!children.length) return false;

    const pages = splitItemsIntoVisualPages(
      toItems(children),
      resolveSectionVisualOrientation(node.attrs?.source),
    );
    const marginsByOrientation = {
      portrait: resolveVisualPageMargins('portrait', node.attrs?.source),
      landscape: resolveVisualPageMargins('landscape', node.attrs?.source),
    };

    pages.forEach((page) => {
      const first = children[page.contentIndexes[0]];
      const last = children[page.contentIndexes[page.contentIndexes.length - 1]];
      if (!first || !last) return;
      const margins = marginsByOrientation[page.orientation];
      const size = visualPageSizeMm(page.orientation);

      decorations.push(
        Decoration.widget(
          first.pos,
          () => createSheet(page.pageNumber, page.orientation),
          { side: -1, ignoreSelection: true, key: `page-sheet-${page.pageNumber}` },
        ),
      );
      decorations.push(
        Decoration.widget(
          first.pos,
          () => createChrome(page.pageNumber, page.orientation),
          { side: -1, ignoreSelection: true, key: `page-chrome-${page.pageNumber}` },
        ),
      );
      decorations.push(
        Decoration.widget(last.pos + last.node.nodeSize, () =>
          createSpacer(page.pageNumber, page.orientation),
        {
          side: 1,
          ignoreSelection: true,
          key: `page-spacer-${page.pageNumber}`,
        }),
      );

      page.contentIndexes.forEach((index, offset) => {
        const child = children[index];
        decorations.push(
          Decoration.node(child.pos, child.pos + child.node.nodeSize, {
            class: 'doc-editor-v2-page-block',
            'data-visual-page': String(page.pageNumber),
            'data-page-orientation': page.orientation,
            'data-page-start': offset === 0 ? 'true' : 'false',
            'data-page-end':
              offset === page.contentIndexes.length - 1 ? 'true' : 'false',
            style: [
              `--v2-page-width:${size.width}mm`,
              `--v2-page-height:${size.height}mm`,
              `--v2-page-margin-top:${margins.top}mm`,
              `--v2-page-margin-right:${margins.right}mm`,
              `--v2-page-margin-bottom:${margins.bottom}mm`,
              `--v2-page-margin-left:${margins.left}mm`,
            ].join(';'),
          }),
        );
      });

      if (page.trailingBreak) {
        const breakChild = children[page.trailingBreak.itemIndex];
        decorations.push(
          Decoration.node(
            breakChild.pos,
            breakChild.pos + breakChild.node.nodeSize,
            {
              class:
                page.trailingBreak.kind === 'section-break'
                  ? 'doc-editor-v2-page-gap doc-editor-v2-page-gap--section'
                  : 'doc-editor-v2-page-gap doc-editor-v2-page-gap--break',
              'data-page-gap': page.trailingBreak.kind,
            },
          ),
        );
      }
    });

    return false;
  });

  return DecorationSet.create(state.doc, decorations);
}

function syncPageFrames(view: EditorView, viewMode: DocumentEditorV2ViewMode) {
  if (viewMode !== 'page') return;
  const root = view.dom;
  const spacers = root.querySelectorAll<HTMLElement>('.doc-editor-v2-page-spacer');
  spacers.forEach((spacer) => {
    const page = spacer.dataset.visualPage;
    if (!page) return;
    const blocks = root.querySelectorAll<HTMLElement>(
      `[data-visual-page="${page}"].doc-editor-v2-page-block`,
    );
    if (!blocks.length) return;
    const first = blocks[0];
    const last = blocks[blocks.length - 1];
    const contentHeightPx =
      last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
    const orientation =
      spacer.dataset.pageOrientation === 'landscape' ? 'landscape' : 'portrait';
    const nominalPx = visualPageSizeMm(orientation).height / MM_PER_PX;
    const extra = Math.max(0, nominalPx - contentHeightPx);
    spacer.style.minHeight = `${extra}px`;

    const overflow = visualPageOverflowsA4({
      contentHeightMm: contentHeightPx * MM_PER_PX,
      orientation,
    });
    const chrome = root.querySelector<HTMLElement>(
      `.doc-editor-v2-page-chrome[data-visual-page="${page}"] .doc-editor-v2-page-overflow`,
    );
    if (chrome) chrome.hidden = !overflow;

    const section = spacer.closest<HTMLElement>('[data-doc-section]');
    const chromeEl = root.querySelector<HTMLElement>(
      `.doc-editor-v2-page-chrome[data-visual-page="${page}"]`,
    );
    const sheet = root.querySelector<HTMLElement>(
      `.doc-editor-v2-page-sheet[data-visual-page="${page}"]`,
    );
    if (!section || !chromeEl || !sheet) return;
    const sectionBox = section.getBoundingClientRect();
    const chromeBox = chromeEl.getBoundingClientRect();
    const spacerBox = spacer.getBoundingClientRect();
    const pxPerCss = sectionBox.width / section.offsetWidth || 1;
    sheet.style.top = `${(chromeBox.top - sectionBox.top) / pxPerCss}px`;
    sheet.style.height = `${(spacerBox.bottom - chromeBox.top) / pxPerCss}px`;
  });
}

export const DocumentPageLayout = Extension.create({
  name: 'documentPageLayout',

  addStorage() {
    return {
      viewMode: 'web' as DocumentEditorV2ViewMode,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: documentEditorV2PageLayoutKey,
        state: {
          init: (_, state) =>
            buildPageDecorations(state, extension.storage.viewMode),
          apply(tr, current, _old, state) {
            const nextMode = tr.getMeta(documentEditorV2PageLayoutKey) as
              | DocumentEditorV2ViewMode
              | undefined;
            if (nextMode) extension.storage.viewMode = nextMode;
            if (tr.docChanged || nextMode) {
              return buildPageDecorations(state, extension.storage.viewMode);
            }
            return current.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return documentEditorV2PageLayoutKey.getState(state);
          },
        },
        view: () => ({
          update(view) {
            syncPageFrames(view, extension.storage.viewMode);
          },
        }),
      }),
    ];
  },
});

export function applyDocumentEditorV2ViewMode(
  editor: Editor | null,
  viewMode: DocumentEditorV2ViewMode,
) {
  if (!editor) return;
  const current = editor.storage.documentPageLayout?.viewMode;
  if (current === viewMode) return;
  if (editor.storage.documentPageLayout) {
    editor.storage.documentPageLayout.viewMode = viewMode;
  }
  editor.view.dispatch(
    editor.state.tr.setMeta(documentEditorV2PageLayoutKey, viewMode),
  );
}
