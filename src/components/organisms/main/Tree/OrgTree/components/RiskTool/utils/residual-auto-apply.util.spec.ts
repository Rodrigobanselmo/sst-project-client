/**
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskTool/utils/residual-auto-apply.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  calculateSuggestedResidualProbability,
  decideResidualAutoApply,
  ResidualAutoApplyTracking,
  residualTrackingContextKey,
} from './calculateSuggestedResidualProbability.util';

const dir = dirname(fileURLToPath(import.meta.url));

const RISK_DATA_ID = 'rfd-gse-06';
const MOEVE = 'ws-moeve';
const REFINARIA = 'ws-refinaria';
const recs = [
  { id: 'r1', recType: RecTypeEnum.ADM },
  { id: 'r2', recType: RecTypeEnum.ADM },
  { id: 'r3', recType: RecTypeEnum.ADM },
  { id: 'r4', recType: RecTypeEnum.ADM },
];
const signature = recs.map((rec) => `${rec.id}:${rec.recType}:`).join('|');

type Row = { probability: number; probabilityAfter: number | null };

/** Simula o efeito da coluna: cada render observa o estabelecimento do cabeçalho e a linha dele. */
function observe(
  previous: ResidualAutoApplyTracking | null,
  workspaceId: string | undefined,
  row: Row,
  rowSignature = signature,
  rowRecs: typeof recs = recs,
) {
  return decideResidualAutoApply({
    previous,
    contextKey: residualTrackingContextKey({ riskDataId: RISK_DATA_ID, workspaceId }),
    signature: rowSignature,
    realProbability: row.probability,
    currentResidual: row.probabilityAfter,
    suggested: calculateSuggestedResidualProbability(row.probability, rowRecs),
  });
}

assert.equal(calculateSuggestedResidualProbability(2, recs), 1);
assert.equal(calculateSuggestedResidualProbability(4, recs), 2);

// Primeira observação só cria a referência.
const first = observe(null, MOEVE, { probability: 2, probabilityAfter: 2 });
assert.equal(first.apply, undefined);

// Refinaria → MOEVE: o residual manual 2 da MOEVE coincide com a sugestão da Refinaria.
const onRefinaria = observe(null, REFINARIA, { probability: 4, probabilityAfter: 2 });
const backToMoeve = observe(onRefinaria.tracking, MOEVE, { probability: 2, probabilityAfter: 2 });
assert.equal(backToMoeve.apply, undefined);
assert.equal(backToMoeve.tracking.contextKey, residualTrackingContextKey({ riskDataId: RISK_DATA_ID, workspaceId: MOEVE }));

// MOEVE → Refinaria: o residual manual 1 da Refinaria coincide com a sugestão da MOEVE.
const onMoeve = observe(null, MOEVE, { probability: 2, probabilityAfter: 1 });
const toRefinaria = observe(onMoeve.tracking, REFINARIA, { probability: 4, probabilityAfter: 1 });
assert.equal(toRefinaria.apply, undefined);

// Alternância repetida preserva o manual nos dois estabelecimentos.
let tracking: ResidualAutoApplyTracking | null = null;
const writes: number[] = [];
for (const [workspaceId, row] of [
  [MOEVE, { probability: 2, probabilityAfter: 2 }],
  [REFINARIA, { probability: 4, probabilityAfter: 1 }],
  [MOEVE, { probability: 2, probabilityAfter: 2 }],
  [REFINARIA, { probability: 4, probabilityAfter: 1 }],
  [MOEVE, { probability: 2, probabilityAfter: 2 }],
] as const) {
  const decision = observe(tracking, workspaceId, row);
  tracking = decision.tracking;
  if (decision.apply != null) writes.push(decision.apply);
}
assert.deepEqual(writes, []);

// No mesmo estabelecimento, mudança real com residual automático recalcula.
const refinariaAuto = observe(null, REFINARIA, { probability: 4, probabilityAfter: 2 });
const refinariaRealDown = observe(refinariaAuto.tracking, REFINARIA, { probability: 3, probabilityAfter: 2 });
assert.equal(refinariaRealDown.apply, 1);

// No mesmo estabelecimento, residual manual diferente da sugestão anterior é preservado.
const refinariaManual = observe(null, REFINARIA, { probability: 4, probabilityAfter: 3 });
const refinariaManualReal = observe(refinariaManual.tracking, REFINARIA, { probability: 5, probabilityAfter: 3 });
assert.equal(refinariaManualReal.apply, undefined);

// No mesmo estabelecimento, nova recomendação com residual automático recalcula.
const fewerRecs = recs.slice(0, 2);
const fewerSignature = fewerRecs.map((rec) => `${rec.id}:${rec.recType}:`).join('|');
const moeveFewer = observe(null, MOEVE, { probability: 4, probabilityAfter: 3 }, fewerSignature, fewerRecs);
const moeveMoreRecs = observe(moeveFewer.tracking, MOEVE, { probability: 4, probabilityAfter: 3 });
assert.equal(moeveMoreRecs.apply, 2);

// Sem recomendações a referência não é criada, como na regra legada.
const noRecs = observe(null, MOEVE, { probability: 4, probabilityAfter: null }, '', []);
const firstRec = observe(noRecs.tracking, MOEVE, { probability: 4, probabilityAfter: null });
assert.equal(firstRec.apply, undefined);

// Elemento caracterizado e quantitativo: valores iguais em qualquer cabeçalho, sem gravação na troca.
const characterization = observe(null, MOEVE, { probability: 3, probabilityAfter: 3 });
const characterizationSwitch = observe(characterization.tracking, REFINARIA, { probability: 3, probabilityAfter: 3 });
assert.equal(characterizationSwitch.apply, undefined);
const characterizationRealChange = observe(characterizationSwitch.tracking, REFINARIA, { probability: 4, probabilityAfter: 1 });
assert.equal(characterizationRealChange.apply, 2);
const noHeader = observe(null, undefined, { probability: 4, probabilityAfter: 2 });
const noHeaderRealChange = observe(noHeader.tracking, undefined, { probability: 3, probabilityAfter: 2 });
assert.equal(noHeaderRealChange.apply, 1);

// Fator diferente no mesmo estabelecimento também é outro contexto.
assert.notEqual(
  residualTrackingContextKey({ riskDataId: 'a', workspaceId: MOEVE }),
  residualTrackingContextKey({ riskDataId: 'b', workspaceId: MOEVE }),
);

for (const version of ['RiskTool', 'RiskToolV2']) {
  const source = readFileSync(
    join(dir, `../../${version}/components/SideRowTable/components/columns/ProbabilityAfterColumn/index.tsx`),
    'utf8',
  );
  assert.match(source, /decideResidualAutoApply\(/);
  assert.match(source, /residualTrackingContextKey\(/);
  assert.match(source, /useTabWorkspaceId\(\)/);
  assert.doesNotMatch(source, /shouldAutoApplySuggestedResidual/);
}

console.log('residual-auto-apply.util.spec: ok');
