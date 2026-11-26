import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { riskFactorAccordionSummarySx, riskFactorNameRowSx, riskFactorNameTypographySx } from './form-risks-analysis-risk-name.styles';

describe('complete risk factor titles', () => {
  it('allows complete names to wrap on narrow screens without ellipsis', () => {
    assert.equal(riskFactorNameTypographySx.whiteSpace, 'normal');
    assert.equal(riskFactorNameTypographySx.overflowWrap, 'anywhere');
    assert.equal('textOverflow' in riskFactorNameTypographySx, false);
    assert.equal(riskFactorNameRowSx.flexWrap, 'wrap');
  });
  it('gives remaining space to the title with a gap before indicators', () => {
    assert.equal(riskFactorAccordionSummarySx['& .MuiAccordionSummary-content > div:first-of-type'].flex, '1 1 0%');
    assert.equal(riskFactorAccordionSummarySx['& .MuiAccordionSummary-content'].gap, '16px');
  });
});
