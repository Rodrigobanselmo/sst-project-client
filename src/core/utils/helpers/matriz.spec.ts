/**
 * Executar:
 * npx tsx src/core/utils/helpers/matriz.spec.ts
 *
 * Matriz qualitativa SimpleSST: 5x5 (S,P ∈ 1..5). Níveis 1..5 = ordinários.
 * Nível 6 = Interromper (estado extraordinário via P>=6). Testes com S=6
 * cobrem só compatibilidade defensiva da 6ª coluna física.
 */
import assert from 'node:assert/strict';

import { getMatrizRisk, resolveMatrixRiskLevel } from './matriz';

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

console.log('matriz.spec.ts ok');
