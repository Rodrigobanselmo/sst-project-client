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
import { toTipTapState } from '../tiptap/to-tiptap-state';
import { decorateTipTapProjection } from './decorate-tiptap-projection';
import { DocumentEditorV2Toolbar } from './DocumentEditorV2Toolbar';
import { useDocumentEditorV2Session } from './DocumentEditorV2Session';
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
  const { remountKey, markLocalDirty } = useDocumentEditorV2Session();
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

  if (!documentData || !content) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
        Selecione uma seção na árvore para ver o Editor V2 experimental.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'warning.main',
        borderRadius: 1,
        p: 2,
        bgcolor: 'common.white',
        '& .ProseMirror': {
          outline: 'none',
          minHeight: 240,
        },
        '& .doc-editor-v2-atom': {
          border: '1px dashed',
          borderColor: 'grey.500',
          bgcolor: 'grey.100',
          px: 1.5,
          py: 1,
          my: 1.5,
          fontFamily: 'monospace',
          fontSize: 13,
          userSelect: 'none',
        },
        '& [data-doc-heading]': {
          fontWeight: 700,
          mt: 2,
          mb: 1,
        },
        '& [data-heading-number]::before': {
          content: 'attr(data-heading-number) " "',
        },
        '& [data-doc-paragraph]': {
          my: 0.75,
        },
      }}
    >
      <DocumentEditorV2Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
}
