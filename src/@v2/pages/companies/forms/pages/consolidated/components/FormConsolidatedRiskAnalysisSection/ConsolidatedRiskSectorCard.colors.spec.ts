/**
 * Executar:
 * npx tsx --test src/@v2/pages/companies/forms/pages/consolidated/components/FormConsolidatedRiskAnalysisSection/ConsolidatedRiskSectorCard.colors.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  acceptSystemRiskMatrixPresentation,
  resolveSystemAxisLevelChipColors,
  resolveSystemOccupationalChipColors,
} from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { getMatrizRisk } from 'core/utils/helpers/matriz';
import { resolveOccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

const here = dirname(fileURLToPath(import.meta.url));
const card = readFileSync(join(here, 'ConsolidatedRiskSectorCard.tsx'), 'utf8');
const equation = readFileSync(
  join(
    here,
    '../../../application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/FrpsMatrixEquation.tsx',
  ),
  'utf8',
);
const occupationalPill = readFileSync(
  join(
    here.split('/src/')[0],
    'src/components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill.tsx',
  ),
  'utf8',
);
const scalePill = readFileSync(
  join(here.split('/src/')[0], 'src/components/atoms/SScaleFactorPill/index.tsx'),
  'utf8',
);

const presentation = acceptSystemRiskMatrixPresentation({
  source: RiskMatrixSourceEnum.SYSTEM,
  axisLevelColors: [
    { value: 1, color: '#111111' },
    { value: 2, color: '#222222' },
    { value: 3, color: '#333333' },
    { value: 4, color: '#444444' },
    { value: 5, color: '#555555' },
  ],
  classifications: [
    { key: 'C1', label: 'Muito baixo', abbreviation: 'MB', color: '#AAAAAA' },
    { key: 'C2', label: 'Baixo', abbreviation: 'B', color: '#BBBBBB' },
    { key: 'C3', label: 'Moderado', abbreviation: 'M', color: '#CCCCCC' },
    { key: 'C4', label: 'Alto', abbreviation: 'A', color: '#DDDDDD' },
    { key: 'C5', label: 'Muito Alto', abbreviation: 'MA', color: '#101010' },
  ],
});

describe('consolidated sector card colors', () => {
  it('reusa a equação compacta com tooltip, P/S e classificação', () => {
    assert.match(card, /FrpsMatrixEquation/);
    assert.match(card, /resolveOccupationalRiskLevel\(/);
    assert.match(card, /probability=\{item\.probability\}/);
    assert.match(card, /severity=\{item\.severity\}/);
    assert.match(card, /resultLevel=\{occupationalLevel\}/);
    assert.equal(card.includes('Probabilidade:'), false);
    assert.equal(card.includes('${color}22'), false);

    assert.match(equation, /resolveSystemAxisLevelChipColors/);
    assert.match(equation, /resolveAxisLevelTooltip/);
    assert.match(equation, /SScaleFactorPill/);
    assert.match(equation, /OccupationalRiskResultPill/);
    assert.match(equation, />\s*e\s*</);
    assert.match(scalePill, /formatSimpleSstScaleFactorLabel/);
    assert.match(scalePill, /backgroundColor: chip\.bgcolor/);
    assert.match(scalePill, /color: chip\.color/);
    assert.match(occupationalPill, /resolveSystemOccupationalChipColors/);
    assert.match(occupationalPill, /backgroundColor: chip\.bgcolor/);
    assert.match(occupationalPill, /color: chip\.color/);
  });

  it('classifica P2 e S5 como Moderado pelo nível numérico', () => {
    assert.equal(resolveOccupationalRiskLevel(5, 2), getMatrizRisk(5, 2)?.level);
    assert.equal(resolveOccupationalRiskLevel(5, 2), 3);
    assert.equal(resolveOccupationalRiskLevel(1, 1), 1);
    assert.equal(resolveOccupationalRiskLevel(undefined, 4), null);
  });

  it('nível 1 usa classificação e os eixos usam a cor do eixo', () => {
    const level = getMatrizRisk(1, 1)?.level;
    assert.equal(level, 1);
    const occupational = resolveSystemOccupationalChipColors(level, presentation);
    const axis = resolveSystemAxisLevelChipColors(1, presentation);
    assert.equal(occupational.bgcolor, '#AAAAAA');
    assert.equal(occupational.color, '#111111');
    assert.equal(axis.bgcolor, '#111111');
    assert.notEqual(occupational.bgcolor, axis.bgcolor);

    const alto = getMatrizRisk(5, 3);
    assert.equal(alto?.level, 4);
    assert.equal(
      resolveSystemOccupationalChipColors(alto?.level, presentation).bgcolor,
      '#DDDDDD',
    );
    assert.equal(resolveSystemAxisLevelChipColors(3, presentation).bgcolor, '#333333');
    assert.equal(resolveSystemAxisLevelChipColors(5, presentation).bgcolor, '#555555');
  });

  it('sem apresentação devolve token de tema', () => {
    const axis = resolveSystemAxisLevelChipColors(1, null);
    const medium = resolveSystemAxisLevelChipColors(3, null);
    const occupational = resolveSystemOccupationalChipColors(
      getMatrizRisk(1, 1)?.level,
      null,
    );
    assert.equal(axis.bgcolor, 'scale.low');
    assert.equal(axis.color, 'common.white');
    assert.equal(medium.bgcolor, 'scale.medium');
    assert.equal(medium.color, 'text.dark');
    assert.equal(occupational.bgcolor, 'scale.low');
    assert.equal(occupational.color, 'common.white');
  });
});
