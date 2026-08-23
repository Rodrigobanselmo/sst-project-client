import React, { useEffect, useMemo, useRef } from 'react';

import { Box, Typography } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';
import { HeadingNumberingMap } from 'components/organisms/documentModel/utils/buildDocumentHeadingNumbering';
import {
  IDocumentModelData,
  IDocumentModelFull,
} from 'core/interfaces/api/IDocumentModel';

import { toDocumentEditorState } from '../adapter';
import { createDocumentEditorExtensions } from '../tiptap/extensions/create-document-editor-extensions';
import { applyDocumentEditorV2ViewMode } from '../tiptap/extensions/document-page-layout.extension';
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { decorateTipTapProjection } from './decorate-tiptap-projection';
import { DocumentEditorV2PageDesk } from './DocumentEditorV2PageDesk';
import { useDocumentEditorV2Host } from './DocumentEditorV2Host';
import { useDocumentEditorV2Session } from './DocumentEditorV2Session';
import { documentEditorV2PageModeSx } from './document-editor-v2-page-layout-sx';
import { consumeEditorEscapeEvent } from './document-editor-v2-session';
import { documentEditorV2SurfaceSx } from './document-editor-v2-surface-sx';
import { ProtectV2Boundaries } from './protect-v2-boundaries.extension';

export function DocumentEditorV2SectionView({
  documentData,
  headingNumbering,
  elements,
}: {
  documentData: IDocumentModelData | null;
  headingNumbering: HeadingNumberingMap;
  elements?: IDocumentModelFull['elements'];
}) {
  const { remountKey, markLocalDirty, viewMode } = useDocumentEditorV2Session();
  const { registerEditor, notifyEditorActivity } = useDocumentEditorV2Host();
  const skipFirstUpdateRef = useRef(true);

  const content = useMemo(() => {
    if (!documentData) return null;
    return decorateTipTapProjection(
      toTipTapState(toDocumentEditorState(documentData)),
      {
        headingNumbering,
        elements,
      },
    );
  }, [documentData, elements, headingNumbering]);

  useEffect(() => {
    skipFirstUpdateRef.current = true;
  }, [remountKey, content]);

  const editor = useEditor(
    {
      extensions: [...createDocumentEditorExtensions(), ProtectV2Boundaries],
      content: content || undefined,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'document-editor-v2-integration',
        },
        handleDOMEvents: {
          keydown: (_view, event) => consumeEditorEscapeEvent(event),
        },
      },
      onUpdate: ({ transaction }) => {
        if (!transaction.docChanged) return;
        if (skipFirstUpdateRef.current) {
          skipFirstUpdateRef.current = false;
          return;
        }
        markLocalDirty();
      },
    },
    [remountKey, content],
  );

  useEffect(() => {
    registerEditor(editor);
    return () => registerEditor(null);
  }, [editor, registerEditor]);

  useEffect(() => {
    if (!editor) return undefined;
    const onActivity = () => notifyEditorActivity();
    editor.on('selectionUpdate', onActivity);
    editor.on('transaction', onActivity);
    return () => {
      editor.off('selectionUpdate', onActivity);
      editor.off('transaction', onActivity);
    };
  }, [editor, notifyEditorActivity]);

  useEffect(() => {
    applyDocumentEditorV2ViewMode(editor, viewMode);
  }, [editor, viewMode]);

  if (!documentData || !content) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
        Selecione uma seção na árvore para ver o Editor V2 experimental.
      </Typography>
    );
  }

  return (
    <Box
      sx={
        {
          border: '1px dashed',
          borderColor: 'warning.main',
          borderRadius: 1,
          p: viewMode === 'page' ? 0 : 2,
          bgcolor: viewMode === 'page' ? 'transparent' : 'common.white',
          ...(documentEditorV2SurfaceSx as object),
          ...(viewMode === 'page' ? documentEditorV2PageModeSx : {}),
        } as const
      }
    >
      <DocumentEditorV2PageDesk viewMode={viewMode}>
        <EditorContent editor={editor} />
      </DocumentEditorV2PageDesk>
    </Box>
  );
}
