/**
 * Executar:
 * npx tsx --test src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-occupational-summary.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { getMatrizRisk } from 'core/utils/helpers/matriz';
import { resolveOccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

import {
  collectDistinctFrpsOccupationalLevels,
  FRPS_OCCUPATIONAL_FILTER_LEVELS,
  frpsOccupationalLevelLabel,
  frpsPassesOccupationalFilter,
} from './frps-occupational-summary.util';

const here = dirname(fileURLToPath(import.meta.url));

describe('FRPS occupational summary', () => {
  it('usa o nível numérico da matriz, sem resolver cor pelo texto', () => {
    assert.equal(resolveOccupationalRiskLevel(1, 1), getMatrizRisk(1, 1)?.level);
    assert.equal(frpsOccupationalLevelLabel(1), 'Muito baixo');
    assert.equal(frpsOccupationalLevelLabel(5), 'Muito Alto');
    assert.equal(resolveOccupationalRiskLevel(undefined, 4), null);
    assert.equal(resolveOccupationalRiskLevel(3, 0), null);
  });

  it('deduplica níveis de agrupamentos e setores não agrupados', () => {
    const levels = collectDistinctFrpsOccupationalLevels({
      severity: 5,
      groupProbabilities: [1, 1],
      ungroupedProbabilities: [3, 5, 0],
    });

    assert.deepEqual(levels, [2, 4, 5]);
    assert.equal(getMatrizRisk(5, 1)?.level, 2);
    assert.equal(getMatrizRisk(5, 3)?.level, 4);
    assert.equal(getMatrizRisk(5, 5)?.level, 5);
  });

  it('com os cinco níveis ativos mantém FRPS sem classificação', () => {
    const all = new Set<number>(FRPS_OCCUPATIONAL_FILTER_LEVELS);
    assert.equal(
      frpsPassesOccupationalFilter({ levels: [], selectedLevels: all }),
      true,
    );
    assert.equal(
      frpsPassesOccupationalFilter({ levels: [2, 3], selectedLevels: all }),
      true,
    );
  });

  it('filtro restritivo exige ao menos um nível selecionado e esconde sem classificação', () => {
    const altoEMuitoAlto = new Set<number>([4, 5]);
    assert.equal(
      frpsPassesOccupationalFilter({
        levels: [2, 4],
        selectedLevels: altoEMuitoAlto,
      }),
      true,
    );
    assert.equal(
      frpsPassesOccupationalFilter({
        levels: [1, 2],
        selectedLevels: altoEMuitoAlto,
      }),
      false,
    );
    assert.equal(
      frpsPassesOccupationalFilter({
        levels: [],
        selectedLevels: altoEMuitoAlto,
      }),
      false,
    );
  });
});

describe('FRPS analysis cards leave local hex tables', () => {
  const analysis = readFileSync(join(here, 'FormRisksAnalysis.tsx'), 'utf8');
  const group = readFileSync(join(here, 'HierarchyGroupRiskAnalysisCard.tsx'), 'utf8');
  const equation = readFileSync(join(here, 'FrpsMatrixEquation.tsx'), 'utf8');
  const dots = readFileSync(join(here, 'FrpsOccupationalLevelDots.tsx'), 'utf8');

  it('cards do not keep the local occupational color map', () => {
    assert.equal(analysis.includes('occupationalRiskColorMap'), false);
    assert.equal(analysis.includes('#3cbe7d'), false);
    assert.equal(group.includes('occupationalRiskColorMap'), false);
    assert.equal(group.includes('#3cbe7d'), false);
  });

  it('equation and collapsed summary use the official resolvers', () => {
    assert.match(equation, /resolveSystemAxisLevelChipColors/);
    assert.match(equation, /useSystemRiskMatrixPresentation/);
    assert.match(equation, /OccupationalRiskResultPill/);
    assert.match(dots, /resolveSystemOccupationalChipColors/);
    assert.match(analysis, /FrpsOccupationalLevelDots/);
    assert.match(analysis, /!isExpanded/);
    assert.match(analysis, /pointerEvents: 'none'/);
  });
});
