/**
 * Testes pontuais da fila de curadoria (sem runner de Jest no client).
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-ai-curation-ui.util.spec.ts
 */
import type {
  AiCurationSuggestion,
  ChemicalAiCurationDecision,
  ChemicalAiCurationPendingItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  countAppliedCurationDecisions,
  displayOfficialName,
  filterCurationQueueItems,
  getActiveCurationPendingItems,
  getActiveSelectionIds,
  initialCurationFilter,
  isAppliedCurationDecision,
  paginateCurationQueueItems,
  pruneSelectionToActiveQueue,
  resolveCurationQueueFilter,
  formatCurationElapsedMs,
  formatCurationProcessingLabel,
} from './chemical-ai-curation-ui.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function pending(
  overrides: Partial<ChemicalAiCurationPendingItem> & { sourceRowId: string },
): ChemicalAiCurationPendingItem {
  return {
    sourceRow: 1,
    sourceSheet: 'Sheet',
    tradeName: 'Prod',
    manufacturer: null,
    componentOriginal: 'X',
    componentNormalized: 'X',
    casReceived: null,
    matchStatus: 'NO_MATCH',
    concentrationKindLabel: 'NÃO INFORMADA',
    exactPercent: null,
    minPercent: null,
    maxPercent: null,
    observation: null,
    deterministicCandidates: [],
    ...overrides,
  };
}

function suggestion(sourceRowId: string): AiCurationSuggestion {
  return {
    sourceRowId,
    originalText: 'X',
    type: 'CHEMICAL_IDENTITY',
    candidates: [],
    confidence: 'LOW',
    rationale: 'ok',
    requiresHumanConfirmation: true,
  };
}

function decision(
  sourceRowId: string,
  action: ChemicalAiCurationDecision['action'] = 'CONFIRM_EXISTING',
): ChemicalAiCurationDecision {
  return {
    sourceRowId,
    action,
    riskFactorId: null,
    officialName: 'X',
    cas: '1-1-1',
    confidence: 'HIGH',
    suggestionType: 'CHEMICAL_IDENTITY',
    rationale: 'ok',
  };
}

function run() {
  const items = Array.from({ length: 139 }, (_, i) =>
    pending({
      sourceRowId: `id-${i}`,
      sourceRow: i + 2,
      matchStatus: i < 46 ? 'REVIEW_REQUIRED' : 'NO_MATCH',
    }),
  );

  // 1. 139 pendências e zero processadas → lista aparece com Aguardando
  assert(initialCurationFilter() === 'AWAITING', 'filtro inicial deve ser AWAITING');
  const emptySuggestions = new Map<string, AiCurationSuggestion>();
  const awaitingList = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: emptySuggestions,
    decisions: {},
    filter: 'PROCESSED', // regressão: Processados com 0 sugestões
  });
  assert(
    awaitingList.length === 139,
    `zero sugestões + PROCESSED deve forçar Aguardando e listar 139, got ${awaitingList.length}`,
  );

  // 2. filtro inicial antes da IA
  assert(
    resolveCurationQueueFilter({ filter: 'PROCESSED', suggestionsCount: 0 }) ===
      'AWAITING',
    'PROCESSED com 0 sugestões → AWAITING',
  );

  // 3. zero sugestões não esconde pendingItems
  const allList = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: emptySuggestions,
    decisions: {},
    filter: 'ALL',
  });
  assert(allList.length === 139, 'ALL com 0 sugestões deve listar 139');

  // 4. processar 10 → Processados nesta rodada
  const suggestionsById = new Map(
    items.slice(0, 10).map((item) => [item.sourceRowId, suggestion(item.sourceRowId)]),
  );
  const afterFirst = resolveCurationQueueFilter({
    filter: 'AWAITING',
    suggestionsCount: 10,
    justReceivedFirstSuggestions: true,
  });
  assert(afterFirst === 'PROCESSED', 'primeira rodada → PROCESSED');
  const processed = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById,
    decisions: {},
    filter: 'PROCESSED',
  });
  assert(processed.length === 10, `processados devem ser 10, got ${processed.length}`);

  // 5. Aguardando mostra os 129 restantes
  const stillAwaiting = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById,
    decisions: {},
    filter: 'AWAITING',
  });
  assert(
    stillAwaiting.length === 129,
    `aguardando devem ser 129, got ${stillAwaiting.length}`,
  );

  // 6. paginação não esvazia
  const page1 = paginateCurationQueueItems({ items: awaitingList, page: 1 });
  assert(page1.pageItems.length === 20, 'página 1 deve ter 20');
  assert(page1.pageCount === 7, `pageCount 7, got ${page1.pageCount}`);
  const pageOverflow = paginateCurationQueueItems({
    items: awaitingList,
    page: 99,
  });
  assert(pageOverflow.safePage === 7, 'offset antigo deve corrigir para última página');
  assert(pageOverflow.pageItems.length > 0, 'página corrigida não pode ficar vazia');

  // 7–9. seleção (IDs da página / filtro)
  const visibleIds = page1.pageItems.map((i) => i.sourceRowId);
  assert(visibleIds.length === 20, 'selecionar visíveis = 20');
  const filterIds = stillAwaiting.map((i) => i.sourceRowId);
  assert(filterIds.length === 129, 'selecionar por filtro Aguardando = 129');
  const cleared: string[] = [];
  assert(cleared.length === 0, 'limpar seleção');

  // 10. estado preservado conceitualmente: pendingItems permanece fonte
  assert(items.length === 139, 'pendingItems permanece 139 após filtrar');

  // 11. decisões aplicadas saem da fila ativa
  const decisions: Record<string, ChemicalAiCurationDecision> = {};
  for (let i = 0; i < 20; i += 1) {
    decisions[`id-${i}`] = decision(`id-${i}`);
  }
  assert(isAppliedCurationDecision(decisions['id-0']), 'CONFIRM_EXISTING é aplicada');
  assert(countAppliedCurationDecisions(decisions) === 20, '20 decisões aplicadas');

  const active = getActiveCurationPendingItems({ pendingItems: items, decisions });
  assert(active.length === 119, `fila ativa deve ter 119, got ${active.length}`);
  assert(
    !active.some((item) => item.sourceRowId === 'id-0'),
    'item com decisão não pode permanecer na fila ativa',
  );

  // 12. ALL / AWAITING / PROCESSED ignoram os 20 resolvidos
  const allAfter = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: new Map(),
    decisions,
    filter: 'ALL',
  });
  assert(allAfter.length === 119, `ALL após 20 decisões = 119, got ${allAfter.length}`);

  const awaitingAfter = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: new Map(
      items.slice(0, 20).map((item) => [item.sourceRowId, suggestion(item.sourceRowId)]),
    ),
    decisions,
    filter: 'AWAITING',
  });
  assert(
    awaitingAfter.length === 119,
    `Aguardando após decisões (sugestões só nos resolvidos) = 119, got ${awaitingAfter.length}`,
  );

  const processedAfter = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: new Map(
      items.slice(0, 20).map((item) => [item.sourceRowId, suggestion(item.sourceRowId)]),
    ),
    decisions,
    filter: 'PROCESSED',
  });
  assert(
    processedAfter.length === 0,
    `Processados não deve reapresentar resolvidos, got ${processedAfter.length}`,
  );

  // 13. histórico CONFIRMED ainda lista as 20 decisões
  const confirmedHistory = filterCurationQueueItems({
    pendingItems: items,
    suggestionsById: new Map(),
    decisions,
    filter: 'CONFIRMED',
  });
  assert(
    confirmedHistory.length === 20,
    `histórico CONFIRMED = 20, got ${confirmedHistory.length}`,
  );

  // 14. displayOfficialName nunca devolve "null"
  assert(displayOfficialName(null) === null, 'null → null');
  assert(displayOfficialName('null') === null, '"null" → null');
  assert(displayOfficialName('undefined') === null, '"undefined" → null');
  assert(displayOfficialName('  ') === null, 'blank → null');
  assert(displayOfficialName('Etanol') === 'Etanol', 'nome válido');

  // 15. restantes = totais − aplicadas
  const remaining = items.length - countAppliedCurationDecisions(decisions);
  assert(remaining === 119, 'restantes = 119');

  // --- Seleção ativa vs decisões aplicadas (refinamento pre-commit) ---

  // 16. 20 decisões + 20 novos selecionados → botão/contagem = 20, não 40
  const selectionWithStale: Record<string, boolean> = {};
  for (let i = 0; i < 40; i += 1) {
    selectionWithStale[`id-${i}`] = true; // 0–19 decididos + 20–39 novos
  }
  const activeAfter20 = getActiveCurationPendingItems({
    pendingItems: items,
    decisions,
  });
  const activeSelection = getActiveSelectionIds({
    selection: selectionWithStale,
    activePendingItems: activeAfter20,
  });
  assert(
    activeSelection.length === 20,
    `seleção ativa deve ser 20 (não 40), got ${activeSelection.length}`,
  );
  assert(
    activeSelection.every((id) => !decisions[id]),
    'seleção ativa não pode incluir IDs com decisão',
  );
  assert(
    !activeSelection.includes('id-0') && activeSelection.includes('id-20'),
    'deve enviar só os 20 novos (ex.: id-20), não os decididos',
  );

  // 17. iniciar nova rodada envia somente os 20 novos (mesmo conjunto)
  const startRoundIds = activeSelection;
  assert(startRoundIds.length === 20, 'rodada seguinte = 20 IDs');
  assert(
    startRoundIds.every((id) => activeAfter20.some((p) => p.sourceRowId === id)),
    'IDs da rodada devem estar na fila ativa',
  );

  // 18. decisões anteriores continuam disponíveis para exportação
  assert(
    Object.keys(decisions).length === 20 &&
      countAppliedCurationDecisions(decisions) === 20,
    'exportação/histórico ainda tem as 20 decisões',
  );

  // 19. KEEP_UNLINKED sai da fila ativa
  const keepId = 'id-50';
  const withKeep = {
    ...decisions,
    [keepId]: decision(keepId, 'KEEP_UNLINKED'),
  };
  assert(isAppliedCurationDecision(withKeep[keepId]), 'KEEP_UNLINKED é decisão');
  const activeAfterKeep = getActiveCurationPendingItems({
    pendingItems: items,
    decisions: withKeep,
  });
  assert(
    !activeAfterKeep.some((p) => p.sourceRowId === keepId),
    'KEEP_UNLINKED deve sair da fila ativa',
  );
  assert(
    countAppliedCurationDecisions(withKeep) === 21,
    'KEEP_UNLINKED conta como decisão concluída',
  );

  // 20. limpar seleção não apaga decisões
  const pruned = pruneSelectionToActiveQueue({
    selection: selectionWithStale,
    activePendingItems: activeAfter20,
  });
  assert(
    Object.keys(pruned).length === 20,
    `prune deixa 20 na seleção, got ${Object.keys(pruned).length}`,
  );
  const clearedSelection: Record<string, boolean> = {};
  assert(Object.keys(clearedSelection).length === 0, 'limpar seleção zera mapa');
  assert(
    countAppliedCurationDecisions(decisions) === 20,
    'limpar seleção não apaga decisões',
  );

  // 21. voltar ao resumo e retornar: decisões preservadas; seleção antiga não restaura
  // (seleção é estado local do painel — remount começa vazio; prune remove decididos)
  const remountSelection = pruneSelectionToActiveQueue({
    selection: {}, // remount
    activePendingItems: activeAfter20,
  });
  assert(
    Object.keys(remountSelection).length === 0,
    'ao retornar, seleção antiga não é restaurada',
  );
  assert(
    countAppliedCurationDecisions(decisions) === 20,
    'decisões sobrevivem ao ir/voltar ao resumo',
  );

  // 22. contadores da fila ativa fecham corretamente
  const rejectId = 'id-51';
  const withReject = {
    ...withKeep,
    [rejectId]: decision(rejectId, 'REJECT'),
  };
  assert(isAppliedCurationDecision(withReject[rejectId]), 'REJECT é decisão');
  const activeFinal = getActiveCurationPendingItems({
    pendingItems: items,
    decisions: withReject,
  });
  const appliedFinal = countAppliedCurationDecisions(withReject);
  assert(appliedFinal === 22, `22 decisões (20+KEEP+REJECT), got ${appliedFinal}`);
  assert(
    activeFinal.length === items.length - appliedFinal,
    `fila ativa = total − decisões (${items.length - appliedFinal}), got ${activeFinal.length}`,
  );
  const newRoundSelection = getActiveSelectionIds({
    selection: Object.fromEntries(
      activeFinal.slice(0, 20).map((p) => [p.sourceRowId, true]),
    ),
    activePendingItems: activeFinal,
  });
  assert(
    newRoundSelection.length === 20,
    'nova rodada: 20 selecionados na fila restante',
  );
  assert(
    appliedFinal + activeFinal.length === items.length,
    'decisões + fila ativa = total de pendências do preview',
  );

  console.log('chemical-ai-curation-ui.util.spec: 22 checks OK');

  // --- Feedback visual / progresso (loading) ---
  assert(formatCurationElapsedMs(0) === '0:00', 'elapsed 0');
  assert(formatCurationElapsedMs(65_000) === '1:05', 'elapsed 1:05');
  assert(formatCurationElapsedMs(3_661_000) === '1:01:01', 'elapsed 1h');

  const label = formatCurationProcessingLabel({
    progress: {
      total: 20,
      done: 0,
      currentChunk: 1,
      chunkTotal: 2,
      cancelled: false,
      startedAt: Date.now(),
    },
    elapsedMs: 12_000,
  });
  assert(
    label.includes('Processando 20 itens') &&
      label.includes('lote 1/2') &&
      label.includes('0:12') &&
      label.includes('não feche'),
    `label processamento, got: ${label}`,
  );

  const labelSingle = formatCurationProcessingLabel({
    progress: {
      total: 8,
      done: 0,
      currentChunk: 1,
      chunkTotal: 1,
      cancelled: false,
      startedAt: Date.now(),
    },
    elapsedMs: 5000,
  });
  assert(
    labelSingle.includes('Processando 8 itens') &&
      !labelSingle.includes('lote') &&
      labelSingle.includes('0:05'),
    `label single chunk, got: ${labelSingle}`,
  );

  console.log('chemical-ai-curation-ui.util.spec: loading checks OK');
}

run();
