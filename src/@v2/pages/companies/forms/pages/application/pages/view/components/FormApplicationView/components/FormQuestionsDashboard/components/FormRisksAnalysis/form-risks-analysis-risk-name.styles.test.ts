/**
 * Testes estruturais do nome do fator de risco (single-line + ellipsis).
 * Executar: npx tsx --test src/@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/form-risks-analysis-risk-name.styles.test.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  riskFactorAccordionSummarySx,
  riskFactorNameRowSx,
  riskFactorNameTypographySx,
} from './form-risks-analysis-risk-name.styles';

const here = dirname(fileURLToPath(import.meta.url));

describe('risk factor name typography styles', () => {
  it('1 short names stay on a single line (nowrap)', () => {
    assert.equal(riskFactorNameTypographySx.whiteSpace, 'nowrap');
  });

  it('2 long names use ellipsis instead of wrapping', () => {
    assert.equal(riskFactorNameTypographySx.overflow, 'hidden');
    assert.equal(riskFactorNameTypographySx.textOverflow, 'ellipsis');
  });

  it('3 flex item can shrink so ellipsis works', () => {
    assert.equal(riskFactorNameTypographySx.minWidth, 0);
    assert.equal(riskFactorNameTypographySx.flex, 1);
    assert.equal(riskFactorNameRowSx.minWidth, 0);
    assert.equal(riskFactorNameRowSx.overflow, 'hidden');
  });

  it('4 accordion summary content yields width to the name row', () => {
    assert.equal(riskFactorAccordionSummarySx['& .MuiAccordionSummary-content'].minWidth, 0);
    assert.equal(
      riskFactorAccordionSummarySx['& .MuiAccordionSummary-content > div:first-of-type'].flex,
      1,
    );
  });
});

describe('FormRisksAnalysis risk name wiring', () => {
  const source = readFileSync(join(here, 'FormRisksAnalysis.tsx'), 'utf8');

  it('5 full text remains accessible via title', () => {
    assert.match(source, /title=\{risk\.name\}/);
    assert.match(source, /sx=\{riskFactorNameTypographySx\}/);
  });

  it('6 expand arrow / accordion behavior unchanged', () => {
    assert.match(source, /expanded=\{isExpanded\}/);
    assert.match(source, /onChange=\{\(\) => handleAccordionChange\(riskId\)\}/);
    assert.match(source, /<SRiskChip/);
    assert.match(source, /Risco adicionado a todos os setores/);
  });

  it('7 styles apply only to the risk name title, not sector badges', () => {
    assert.match(source, /riskFactorNameTypographySx/);
    assert.equal(source.includes('sectorRowBadgeTextSx'), true);
    // Nome do risco não reutiliza estilos de badge de setor.
    const titleBlockStart = source.indexOf('title={');
    const titleBlockEnd = source.indexOf('</SFlex>', titleBlockStart);
    const titleBlock = source.slice(titleBlockStart, titleBlockEnd);
    assert.match(titleBlock, /riskFactorNameTypographySx/);
    assert.equal(titleBlock.includes('sectorRowBadgeTextSx'), false);
    assert.equal(titleBlock.includes('whiteSpace: \'normal\''), false);
    assert.equal(titleBlock.includes('wordBreak'), false);
  });
});
