/**
 * Bloco B — resumo/retomada local da análise operacional.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/utils/summarize-ai-session-analysis.util.spec.ts
 */
import {
  hasRecoverableAiSessionAnalysis,
  summarizeAiSessionAnalysis,
} from './summarize-ai-session-analysis.util';
import {
  buildAiRiskAnalysisSessionKey,
  readAiRiskAnalysisSession,
  writeAiRiskAnalysisSession,
  type AiRiskAnalysisSessionSnapshot,
} from './ai-risk-analysis-session-storage.util';
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const emptyInput = {
  hasAnalyzed: false,
  pendingNewRiskCount: 0,
  pendingReviewCount: 0,
  acceptedNewRiskCount: 0,
  acceptedModularCount: 0,
  discardedNewRiskCount: 0,
  discardedModularCount: 0,
};

// 1) Estado vazio
assert(
  hasRecoverableAiSessionAnalysis(emptyInput) === false,
  'sem análise: não recuperável',
);
assert(
  summarizeAiSessionAnalysis(emptyInput).hasRecoverableAnalysis === false,
  'resumo vazio',
);

// 2) Recuperação com resultados
const withPending = summarizeAiSessionAnalysis({
  ...emptyInput,
  hasAnalyzed: true,
  pendingReviewCount: 2,
  pendingNewRiskCount: 1,
});
assert(withPending.hasRecoverableAnalysis, 'com hasAnalyzed é recuperável');
assert(withPending.pendingReviewCount === 2, 'pendentes preservados');

// 3) Isolamento GSE vs Elemento
const gseKeyA = buildAiRiskAnalysisSessionKey({
  gseId: 'gse-1',
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-a',
});
const gseKeyB = buildAiRiskAnalysisSessionKey({
  gseId: 'gse-2',
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-a',
});
const elemKey = buildAiRiskAnalysisSessionKey({
  characterizationId: 'char-1',
  riskGroupId: 'rg-1',
  companyId: 'co-1',
  workspaceId: 'ws-a',
});
assert(gseKeyA !== gseKeyB, 'GSEs diferentes → chaves diferentes');
assert(gseKeyA !== elemKey, 'GSE ≠ Elemento');
assert(gseKeyA?.startsWith('gse-ai-risk-analysis:'), 'prefixo GSE');
assert(elemKey?.startsWith('characterization-ai-risk-analysis:'), 'prefixo Elemento');

const snapshot: AiRiskAnalysisSessionSnapshot = {
  suggestions: [{ id: 'r1' } as any],
  existingRiskReviews: [],
  addedRiskIds: ['r2'],
  dismissedRiskIds: ['r3'],
  modifiedRisks: {},
  userGuidance: 'contexto',
  temporaryDocumentSource: {
    kind: 'user_pdf',
    fileName: 'apoio.pdf',
    extractedText: 'texto',
  },
  expandedSuggestionIds: [],
  appliedModularSuggestionKeys: ['r2:probability:3'],
  dismissedModularSuggestionKeys: ['r3:generateSource:x'],
  hasAnalyzed: true,
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    sessionStorage: (() => {
      const map = new Map<string, string>();
      return {
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => {
          map.set(k, v);
        },
        removeItem: (k: string) => {
          map.delete(k);
        },
      };
    })(),
  };
}

writeAiRiskAnalysisSession(gseKeyA, snapshot);
writeAiRiskAnalysisSession(elemKey, {
  ...snapshot,
  suggestions: [{ id: 'other' } as any],
  hasAnalyzed: true,
});

const restoredGse = readAiRiskAnalysisSession(gseKeyA);
const restoredElem = readAiRiskAnalysisSession(elemKey);
assert(restoredGse?.suggestions[0]?.id === 'r1', 'GSE restaura própria sessão');
assert(restoredElem?.suggestions[0]?.id === 'other', 'Elemento isolado');
assert(
  restoredGse?.temporaryDocumentSource?.fileName === 'apoio.pdf',
  'PDF temporário da sessão preservado',
);

// 4) Aceitas/descartadas não contam como pendentes (contagens já filtradas)
const afterActions = summarizeAiSessionAnalysis({
  hasAnalyzed: true,
  pendingNewRiskCount: 0,
  pendingReviewCount: 0,
  acceptedNewRiskCount: 1,
  acceptedModularCount: 1,
  discardedNewRiskCount: 1,
  discardedModularCount: 1,
});
assert(afterActions.hasRecoverableAnalysis, 'ainda recuperável após ações');
assert(afterActions.pendingNewRiskCount === 0, 'aceitas/descartadas ≠ pendentes novas');
assert(afterActions.pendingReviewCount === 0, 'aceitas/descartadas ≠ pendentes review');

// 5) Contrato UI: painel e wiring sem nova chamada na retomada
const panelSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/AiSessionAnalysesPanel/AiSessionAnalysesPanel.tsx',
  'utf8',
);
const gseSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);
const elementoSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent.tsx',
  'utf8',
);
const hierarchySource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAddHierarchyRisk/index.tsx',
  'utf8',
);
const formSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoFormContent.tsx',
  'utf8',
);

assert(
  panelSource.includes('Análises desta sessão'),
  'título da área',
);
assert(
  panelSource.includes('Nenhuma análise disponível nesta sessão.'),
  'mensagem vazia',
);
assert(
  !panelSource.includes('mutateAsync'),
  'painel não chama mutateAsync',
);
assert(
  !panelSource.includes('handleAnalyze'),
  'painel não chama handleAnalyze',
);

assert(gseSource.includes('<AiSessionAnalysesPanel'), 'GSE monta painel');
assert(
  gseSource.includes('onReturnToTable={') &&
    gseSource.includes('isRisksTabDialog && onCloseDialog'),
  'GSE retoma na tabela sem nova análise',
);
assert(
  elementoSource.includes('<AiSessionAnalysesPanel'),
  'Elemento monta painel',
);
assert(
  elementoSource.includes('onReturnToTable={onCloseDialog}'),
  'Elemento usa onCloseDialog local',
);
assert(
  hierarchySource.includes('onCloseDialog={onClose}'),
  'Elemento recebe onClose do provider',
);

// 6) Aba antiga GSE permanece full + estado compartilhado
assert(
  formSource.includes('presentation="risksTabDialog"'),
  'dialog Fatores usa risksTabDialog',
);
assert(
  formSource.includes('<GhoAiAnalysisContent') &&
    formSource.includes('aiRiskAnalysis={gseAi.analysis}'),
  'aba antiga mantém GhoAiAnalysisContent com estado compartilhado',
);
assert(
  gseSource.includes("presentation = 'full'"),
  'aba antiga default full',
);

console.log('summarize-ai-session-analysis.util.spec.ts OK');
