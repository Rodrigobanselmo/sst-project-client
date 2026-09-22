/**
 * Executar:
 * npx tsx src/core/utils/helpers/matriz.spec.ts
 *
 * Matriz qualitativa SimpleSST: 5x5 (S,P ∈ 1..5). Níveis 1..5 = ordinários.
 * Nível 6 = Interromper (estado extraordinário via P>=6).
 * Fase 1C: snapshot CUSTOM governa label/cor; level é só ponte operacional.
 */
import assert from 'node:assert/strict';

import {
  getMatrizRisk,
  hasCustomMatrixSnapshot,
  resolveDisplayedOccupationalRisk,
  resolveDisplayedResidualOccupationalRisk,
  resolveMatrixRiskLevel,
} from './matriz';

const EXPECTED_LEVEL: Record<number, Record<number, number>> = {
  1: { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2 },
  2: { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3 },
  3: { 1: 2, 2: 2, 3: 3, 4: 3, 5: 4 },
  4: { 1: 2, 2: 3, 3: 3, 4: 4, 5: 5 },
  5: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 5 },
};

assert.equal(resolveMatrixRiskLevel(), 0);
assert.equal(resolveMatrixRiskLevel(3), 0);
assert.equal(resolveMatrixRiskLevel(undefined, 3), 0);
assert.equal(resolveMatrixRiskLevel(0, 4), 0);
assert.equal(resolveMatrixRiskLevel(4, 0), 0);
assert.equal(getMatrizRisk(), null);
assert.equal(getMatrizRisk(3, 0), null);

// Estado extraordinário Interromper: transportado por P >= 6, não é 6ª classe qualitativa.
assert.equal(resolveMatrixRiskLevel(1, 6), 6);
assert.equal(resolveMatrixRiskLevel(5, 6), 6);
assert.equal(resolveMatrixRiskLevel(3, 7), 6);
assert.equal(getMatrizRisk(1, 6)?.level, 6);
assert.equal(getMatrizRisk(1, 6)?.short, 'IA');

assert.equal(resolveMatrixRiskLevel(1, 1), 1);
assert.equal(resolveMatrixRiskLevel(5, 5), 5);
assert.equal(getMatrizRisk(1, 1)?.level, 1);
assert.equal(getMatrizRisk(5, 5)?.level, 5);

assert.equal(resolveMatrixRiskLevel(3, 5), 4);
assert.equal(resolveMatrixRiskLevel(5, 2), 3);
assert.equal(resolveMatrixRiskLevel(4, 1), 2);
assert.equal(resolveMatrixRiskLevel(2, 4), 3);

// Legado/defensivo: severity=6 inválido ainda cai na 6ª coluna física (não é eixo metodológico).
assert.equal(resolveMatrixRiskLevel(6, 1), 6);
assert.equal(resolveMatrixRiskLevel(6, 5), 6);

for (let probability = 1; probability <= 5; probability += 1) {
  for (let severity = 1; severity <= 5; severity += 1) {
    const level = resolveMatrixRiskLevel(severity, probability);
    assert.equal(
      level,
      EXPECTED_LEVEL[probability][severity],
      `getMatrizRisk(${severity}, ${probability}) should be ${EXPECTED_LEVEL[probability][severity]}, got ${level}`,
    );
    assert.equal(getMatrizRisk(severity, probability)?.level, level);
    assert.equal(
      resolveMatrixRiskLevel(severity, probability),
      resolveMatrixRiskLevel(probability, severity),
      `SimpleSST 5x5 must stay symmetric under argument swap for P=${probability} S=${severity}`,
    );
  }
}

// Quantitativo: level é autoridade — S4 + “P1” espelhado NÃO vira Baixo.
assert.equal(
  resolveDisplayedOccupationalRisk({
    isQuantity: true,
    level: 1,
    severity: 4,
    probability: 1,
  })?.level,
  1,
);
assert.equal(
  resolveDisplayedOccupationalRisk({
    isQuantity: true,
    level: 1,
    severity: 4,
    probability: 1,
  })?.short,
  'MB',
);
assert.equal(
  getMatrizRisk(4, 1)?.level,
  2,
  'legacy S×P still maps S4×P1 → Baixo (proves why we must not use it for quantity)',
);
assert.equal(
  resolveDisplayedOccupationalRisk({
    isQuantity: true,
    level: 3,
    severity: 4,
    probability: 3,
  })?.level,
  3,
);
assert.equal(
  resolveDisplayedOccupationalRisk({
    isQuantity: true,
    level: 6,
    severity: 4,
    probability: 6,
  })?.level,
  6,
);

// A. SYSTEM qualitativo → apresentação atual inalterada.
assert.equal(
  resolveDisplayedOccupationalRisk({
    isQuantity: false,
    level: 99,
    severity: 4,
    probability: 1,
  })?.level,
  2,
);
assert.equal(
  resolveDisplayedOccupationalRisk({
    severity: 4,
    probability: 2,
  })?.label,
  'Moderado',
);
assert.equal(
  resolveDisplayedOccupationalRisk({
    matrixSource: 'SYSTEM',
    matrixEvaluatedAt: new Date(),
    severity: 4,
    probability: 1,
  })?.label,
  'Baixo',
);

// B. CUSTOM 5 classes → label/cor do snapshot.
{
  const ro = resolveDisplayedOccupationalRisk({
    severity: 4,
    probability: 3,
    level: 4,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v5',
    matrixEvaluatedAt: new Date(),
    resolvedLabel: 'Alto Custom',
    resolvedColor: '#FF8800',
    resolvedLegacyBand: 4,
  });
  assert.equal(ro?.label, 'Alto Custom');
  assert.equal(ro?.color, '#FF8800');
  assert.equal(ro?.level, 4);
  assert.equal(ro?.isCustomSnapshot, true);
  assert.notEqual(ro?.label, 'Alto');
}

// C. CUSTOM 4 classes → label/cor CUSTOM.
{
  const ro = resolveDisplayedOccupationalRisk({
    severity: 1,
    probability: 1,
    level: 2,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v4',
    matrixEvaluatedAt: new Date(),
    resolvedLabel: 'Irrelevante',
    resolvedColor: '#00AA00',
    resolvedLegacyBand: 2,
  });
  assert.equal(ro?.label, 'Irrelevante');
  assert.equal(ro?.color, '#00AA00');
  assert.equal(ro?.level, 2);
}

// D. CUSTOM level 2 de bands [1,2] → NÃO exibir label SimpleSST "Baixo".
{
  assert.equal(getMatrizRisk(2, 2)?.label, 'Baixo');
  const ro = resolveDisplayedOccupationalRisk({
    severity: 2,
    probability: 2,
    level: 2,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'seller-v1',
    matrixEvaluatedAt: new Date(),
    resolvedLabel: 'Irrelevante',
    resolvedColor: '#00AA00',
    resolvedLegacyBand: 2,
  });
  assert.equal(ro?.level, 2);
  assert.equal(ro?.label, 'Irrelevante');
  assert.notEqual(ro?.label, 'Baixo');
}

// E. residual CUSTOM → residualLabel/residualColor.
{
  const residual = resolveDisplayedResidualOccupationalRisk({
    severity: 4,
    probabilityAfter: 2,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v1',
    matrixEvaluatedAt: new Date(),
    residualLabel: 'Irrelevante',
    residualColor: '#00AA00',
    residualLegacyBand: 2,
  });
  assert.equal(residual?.label, 'Irrelevante');
  assert.equal(residual?.color, '#00AA00');
  assert.equal(residual?.level, 2);
  assert.notEqual(residual?.label, getMatrizRisk(4, 2)?.label);
}

// F. SYSTEM residual → cálculo atual preservado.
{
  const residual = resolveDisplayedResidualOccupationalRisk({
    severity: 4,
    probabilityAfter: 2,
  });
  assert.equal(residual?.level, getMatrizRisk(4, 2)?.level);
  assert.equal(residual?.label, getMatrizRisk(4, 2)?.label);
}

// G. quantitativo → apresentação atual preservada (já acima) + CUSTOM não invade.
{
  const quant = resolveDisplayedOccupationalRisk({
    isQuantity: true,
    level: 1,
    severity: 4,
    probability: 1,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v1',
    resolvedLabel: 'NÃO USAR',
  });
  assert.equal(quant?.level, 1);
  assert.equal(quant?.short, 'MB');
  assert.notEqual(quant?.label, 'NÃO USAR');
}

// H. CUSTOM P6/Interromper → contrato da API.
{
  const ro = resolveDisplayedOccupationalRisk({
    severity: 4,
    probability: 6,
    level: 6,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v1',
    matrixEvaluatedAt: new Date(),
    resolvedLabel: 'Interromper',
    resolvedColor: null,
    resolvedLegacyBand: null,
  });
  assert.equal(ro?.level, 6);
  assert.equal(ro?.label, 'Interromper');
  assert.equal(ro?.isCustomSnapshot, true);
}

// I. ausência/incompletude de snapshot CUSTOM → sem inventar classification.
assert.equal(hasCustomMatrixSnapshot(null), false);
assert.equal(hasCustomMatrixSnapshot({ matrixSource: 'CUSTOM' }), false);
{
  const incomplete = resolveDisplayedOccupationalRisk({
    severity: 4,
    probability: 3,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v1',
    matrixEvaluatedAt: new Date(),
    resolvedLabel: null,
    resolvedColor: null,
    resolvedLegacyBand: 4,
  });
  assert.equal(incomplete?.label, '--');
  assert.equal(incomplete?.level, 4);
  assert.notEqual(incomplete?.label, 'Alto');
}
{
  const residualIncomplete = resolveDisplayedResidualOccupationalRisk({
    severity: 4,
    probabilityAfter: 2,
    matrixSource: 'CUSTOM',
    matrixVersionId: 'v1',
    matrixEvaluatedAt: new Date(),
  });
  assert.equal(residualIncomplete, null);
}

console.log('matriz.spec.ts ok');
