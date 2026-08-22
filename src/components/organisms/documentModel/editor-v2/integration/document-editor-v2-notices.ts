export const DOCUMENT_EDITOR_V2_BLOCK_SWITCH_REASON =
  'Há alterações locais no Editor V2 experimental. Descarte-as para voltar ao clássico. Nada foi salvo no modelo.';

export const DOCUMENT_EDITOR_V2_BLOCK_SECTION_REASON =
  'Há alterações locais no Editor V2 experimental. A seção do experimento permanece fixa. Descarte-as para acompanhar a árvore.';

export const DOCUMENT_EDITOR_V2_BLOCK_SAVE_REASON =
  'O save oficial não inclui o Editor V2 nesta fase. Descarte as alterações experimentais antes de salvar o modelo.';

export const DOCUMENT_EDITOR_V2_BLOCK_CLOSE_REASON =
  'Há alterações locais no Editor V2 experimental. Elas não fazem parte do modelo e serão perdidas.';

export const DOCUMENT_EDITOR_V2_DISCARD_MODAL = {
  title: 'Descartar experimento V2?',
  text: DOCUMENT_EDITOR_V2_BLOCK_CLOSE_REASON,
  confirmText: 'Descartar experimento',
  confirmCancel: 'Continuar no V2',
  tag: 'warning' as const,
};
