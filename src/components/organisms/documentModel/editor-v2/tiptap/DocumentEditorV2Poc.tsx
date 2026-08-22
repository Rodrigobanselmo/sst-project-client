import React, { useMemo, useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';
import { EditorContent, useEditor } from '@tiptap/react';

import {
  collectCanonicalIds,
  persistJson,
  toDocumentEditorState,
} from '../adapter';
import { fromDocumentEditorState } from '../adapter/fromDocumentEditorState';
import { buildPocCanonicalModel } from '../adapter/fixtures/poc-canonical.fixture';
import { UnsupportedTipTapStructureError } from '../domain/unsupported-tiptap.error';
import { consumeEditorEscapeEvent } from '../integration/document-editor-v2-session';
import { documentEditorV2SurfaceSx } from '../integration/document-editor-v2-surface-sx';
import { createDocumentEditorExtensions } from './extensions/create-document-editor-extensions';
import { buildLargeDefinitionsRunModel } from './fixtures/large-run.fixture';
import { fromTipTapState } from './from-tiptap-state';
import { toTipTapState } from './to-tiptap-state';

type FixtureName = 'poc' | 'large';

function loadModel(fixture: FixtureName) {
  return fixture === 'large'
    ? buildLargeDefinitionsRunModel()
    : buildPocCanonicalModel();
}

export function DocumentEditorV2Poc() {
  const [fixture, setFixture] = useState<FixtureName>('poc');
  const [status, setStatus] = useState(
    'Pronto — edição visual apenas. Sem save.',
  );
  const model = useMemo(() => loadModel(fixture), [fixture]);
  const initialContent = useMemo(
    () => toTipTapState(toDocumentEditorState(model)),
    [model],
  );

  const editor = useEditor(
    {
      extensions: createDocumentEditorExtensions(),
      content: initialContent,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'document-editor-v2-poc',
        },
        handleDOMEvents: {
          keydown: (_view, event) => consumeEditorEscapeEvent(event),
        },
      },
    },
    [fixture],
  );

  const onSerialize = () => {
    if (!editor) return;
    try {
      const restored = fromDocumentEditorState(
        fromTipTapState(editor.getJSON()),
      );
      const same =
        JSON.stringify(persistJson(restored)) ===
        JSON.stringify(persistJson(model));
      const ids = collectCanonicalIds(restored);
      setStatus(
        same
          ? `Lossless. ${ids.length} IDs preservados.`
          : `JSON divergiu do fixture original (edição local). ${ids.length} IDs na volta.`,
      );
    } catch (error) {
      const message =
        error instanceof UnsupportedTipTapStructureError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'erro desconhecido';
      setStatus(`Unsupported: ${message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 960 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Editor V2 — POC TipTap isolada
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Superfície contínua para PARAGRAPHs consecutivos. Headings e atoms são
        boundaries. Enter que cria parágrafo sem id canônico não é suportado.
        Não grava, não fala com a API e não substitui o V1.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant={fixture === 'poc' ? 'contained' : 'outlined'}
          onClick={() => setFixture('poc')}
        >
          Fixture curto
        </Button>
        <Button
          variant={fixture === 'large' ? 'contained' : 'outlined'}
          onClick={() => setFixture('large')}
        >
          Run ~100 parágrafos
        </Button>
        <Button variant="outlined" onClick={onSerialize}>
          Serializar
        </Button>
      </Stack>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {status}
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          p: 2,
          bgcolor: 'common.white',
          ...documentEditorV2SurfaceSx,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 280,
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
