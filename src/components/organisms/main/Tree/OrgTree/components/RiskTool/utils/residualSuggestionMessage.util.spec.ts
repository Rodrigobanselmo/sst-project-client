/**
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskTool/utils/residualSuggestionMessage.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RecTypeEnum } from 'project/enum/recType.enum';

import { calculateSuggestedResidualProbability } from './calculateSuggestedResidualProbability.util';
import { residualSuggestionMessage } from './residualSuggestionMessage.util';

const dir = dirname(fileURLToPath(import.meta.url));
const fourAdm = Array.from({ length: 4 }, () => ({ recType: RecTypeEnum.ADM }));

// MOEVE: P2, sugestão P1.
const moeveSuggested = calculateSuggestedResidualProbability(2, fourAdm);
assert.equal(moeveSuggested, 1);

const matches = residualSuggestionMessage({ hasRecommendations: true, residual: 1, suggested: moeveSuggested });
assert.equal(matches?.kind, 'matches');
assert.equal(matches?.text, 'Conforme sugestão do sistema: P1');
assert.equal(matches?.color, 'info.main');
assert.equal(matches?.canApplySuggestion, false);

const differs = residualSuggestionMessage({ hasRecommendations: true, residual: 2, suggested: moeveSuggested });
assert.equal(differs?.kind, 'differs');
assert.equal(differs?.text, 'Valor adotado: P2 · Sugestão do sistema: P1');
assert.equal(differs?.color, 'warning.dark');
assert.equal(differs?.canApplySuggestion, true);

// Refinaria: P4, sugestão P2, residual 3.
const refinariaSuggested = calculateSuggestedResidualProbability(4, fourAdm);
const refinaria = residualSuggestionMessage({ hasRecommendations: true, residual: 3, suggested: refinariaSuggested });
assert.equal(refinaria?.text, 'Valor adotado: P3 · Sugestão do sistema: P2');

// Sem probabilidade real válida não há sugestão inventada.
const noReal = calculateSuggestedResidualProbability(undefined, fourAdm);
assert.equal(noReal, undefined);
const insufficient = residualSuggestionMessage({ hasRecommendations: true, residual: 2, suggested: noReal });
assert.equal(insufficient?.kind, 'insufficient');
assert.doesNotMatch(insufficient?.text ?? '', /P\d/);
assert.equal(insufficient?.color, 'text.secondary');
assert.equal(insufficient?.canApplySuggestion, false);

// Residual vazio continua oferecendo a sugestão.
const empty = residualSuggestionMessage({ hasRecommendations: true, residual: null, suggested: 1 });
assert.equal(empty?.text, 'Sugestão do sistema: P1');
assert.equal(empty?.canApplySuggestion, true);
assert.equal(residualSuggestionMessage({ hasRecommendations: true, residual: 0, suggested: 1 })?.kind, 'suggestion');

// Sem recomendações o residual não se aplica.
assert.equal(residualSuggestionMessage({ hasRecommendations: false, residual: 2, suggested: 1 }), null);

// Nenhum texto atribui autoria ao valor.
for (const message of [matches, differs, refinaria, insufficient, empty]) {
  assert.doesNotMatch(message?.text ?? '', /manual|escolh|sistema escolheu|usuário/i);
}

for (const version of ['RiskTool', 'RiskToolV2']) {
  const source = readFileSync(
    join(dir, `../../${version}/components/SideRowTable/components/columns/ProbabilityAfterColumn/index.tsx`),
    'utf8',
  );
  assert.match(source, /residualSuggestionMessage\(/);
  assert.doesNotMatch(source, /Sugestão pela hierarquia de controles/);
}

console.log('residualSuggestionMessage.util.spec: ok');
