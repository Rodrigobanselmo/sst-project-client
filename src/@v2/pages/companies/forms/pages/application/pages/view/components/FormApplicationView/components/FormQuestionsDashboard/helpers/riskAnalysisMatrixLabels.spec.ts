/**
 * Executar:
 * npx tsx --test src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/riskAnalysisMatrixLabels.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { acceptSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import palette from 'configs/theme/palette';
import { lightSurfaceTokens } from 'configs/theme/semantic-surfaces';

import { buildSectorRiskClassificationPdf } from './riskAnalysisMatrixLabels';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = `${here.split('/src/')[0]}/src`;

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
    { key: 'C1', label: 'Muito Baixo', abbreviation: 'MB', color: '#AAAAAA' },
    { key: 'C2', label: 'Baixo', abbreviation: 'B', color: '#BBBBBB' },
    { key: 'C3', label: 'Moderado', abbreviation: 'M', color: '#CCCCCC' },
    { key: 'C4', label: 'Alto', abbreviation: 'A', color: '#DDDDDD' },
    { key: 'C5', label: 'Muito Alto', abbreviation: 'MA', color: '#101010' },
  ],
});

describe('PDF risk analysis colors', () => {
  it('nível 1 / Muito baixo não cai em cinza por comparação textual', () => {
    const classification = buildSectorRiskClassificationPdf(1, 1, presentation);

    assert.equal(classification.occupationalRiskLabel, 'Muito baixo');
    assert.equal(classification.occupationalRiskColor, '#AAAAAA');
    assert.equal(classification.occupationalRiskTextColor, '#111111');
    assert.notEqual(classification.occupationalRiskColor, '#EEEEEE');
    assert.notEqual(classification.occupationalRiskColor, '#eeeeee');
  });

  it('risco ocupacional usa a cor da classificação e eixos usam a cor do eixo', () => {
    const classification = buildSectorRiskClassificationPdf(5, 3, presentation);

    assert.equal(classification.occupationalRiskLabel, 'Alto');
    assert.equal(classification.probabilityLabel, '03 Moderada');
    assert.equal(classification.severityLabel, '05 Excessiva');
    assert.equal(classification.probabilityColor, '#333333');
    assert.equal(classification.probabilityTextColor, '#FFFFFF');
    assert.equal(classification.severityColor, '#555555');
    assert.equal(classification.severityTextColor, '#FFFFFF');
    assert.equal(classification.occupationalRiskColor, '#DDDDDD');
    assert.equal(classification.occupationalRiskTextColor, '#111111');
    assert.notEqual(
      classification.occupationalRiskColor,
      classification.probabilityColor,
    );
    assert.notEqual(
      classification.occupationalRiskColor,
      classification.severityColor,
    );
  });

  it('sem apresentação customizada materializa o palette oficial da tela', () => {
    const levelOne = buildSectorRiskClassificationPdf(1, 1, null);
    const mixed = buildSectorRiskClassificationPdf(3, 1, null);
    const missing = buildSectorRiskClassificationPdf(0, 0);

    assert.equal(levelOne.occupationalRiskLabel, 'Muito baixo');
    assert.equal(levelOne.probabilityColor, palette.scale.low);
    assert.equal(levelOne.severityColor, palette.scale.low);
    assert.equal(levelOne.occupationalRiskColor, palette.scale.low);
    assert.equal(levelOne.probabilityTextColor, '#FFFFFF');
    assert.equal(levelOne.occupationalRiskTextColor, '#FFFFFF');
    assert.notEqual(levelOne.occupationalRiskColor, '#eeeeee');

    assert.equal(mixed.probabilityColor, palette.scale.low);
    assert.equal(mixed.probabilityTextColor, '#FFFFFF');
    assert.equal(mixed.severityColor, palette.scale.medium);
    assert.equal(mixed.severityTextColor, palette.text.dark);
    assert.equal(mixed.occupationalRiskLabel, 'Baixo');
    assert.equal(mixed.occupationalRiskColor, palette.scale.mediumLow);
    assert.equal(mixed.occupationalRiskTextColor, '#FFFFFF');

    assert.equal(missing.probabilityLabel, 'Não informado');
    assert.equal(missing.severityLabel, 'Não informado');
    assert.equal(missing.occupationalRiskLabel, 'Não informado');
    assert.equal(missing.probabilityColor, palette.grey[300]);
    assert.equal(missing.occupationalRiskColor, palette.grey[300]);
    assert.equal(
      missing.probabilityTextColor,
      lightSurfaceTokens.text.secondary,
    );
    assert.equal(
      missing.occupationalRiskTextColor,
      lightSurfaceTokens.text.secondary,
    );
  });

  it('background e textColor chegam ao modelo consumido pelo PDF', () => {
    const pdf = readFileSync(
      join(srcRoot, 'components/pdfs/documents/formsRiskAnalysis/formsRiskAnalysis.pdf.tsx'),
      'utf8',
    );
    const labels = readFileSync(join(here, 'riskAnalysisMatrixLabels.ts'), 'utf8');
    const applicationExport = readFileSync(
      join(here, 'exportFormRiskAnalysisPdfInBrowser.ts'),
      'utf8',
    );
    const consolidatedExport = readFileSync(
      join(
        srcRoot,
        '@v2/pages/companies/forms/pages/consolidated/helpers/exportConsolidatedRiskAnalysisPdfInBrowser.ts',
      ),
      'utf8',
    );

    assert.match(pdf, /backgroundColor: color/);
    assert.match(pdf, /color: textColor/);
    assert.match(pdf, /probabilityTextColor/);
    assert.match(pdf, /severityTextColor/);
    assert.match(pdf, /occupationalRiskTextColor/);
    assert.equal(labels.includes('occupationalRiskColorMap'), false);
    assert.equal(labels.includes("'Muito Baixo'"), false);
    assert.match(applicationExport, /loadSystemRiskMatrixPresentationForPdf/);
    assert.match(consolidatedExport, /loadSystemRiskMatrixPresentationForPdf/);
    assert.match(consolidatedExport, /systemPresentation/);
  });
});
