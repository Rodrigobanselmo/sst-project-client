import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  surveyCommitEnabled,
  surveyRowNeedsManualResolution,
  toSurveyProductKeyMap,
} from './chemical-survey-import-resolution.util';

describe('chemical-survey-import-resolution.util', () => {
  const uniqueRow = {
    productKey: 'acetona::synth',
    tradeName: 'ACETONA',
    manufacturer: 'SYNTH',
    automaticResolution: 'MATCH_UNIQUE' as const,
    productResolution: 'MATCH_UNIQUE' as const,
  };
  const notFoundRow = {
    productKey: 'ezolem::',
    tradeName: 'BRASKEM EZOLEM 6/7',
    manufacturer: null,
    automaticResolution: 'MATCH_NOT_FOUND' as const,
    productResolution: 'MATCH_NOT_FOUND' as const,
  };
  const ambiguousRow = {
    productKey: 'irganox 1010::basf',
    tradeName: 'Irganox® 1010',
    manufacturer: 'BASF',
    automaticResolution: 'MATCH_AMBIGUOUS' as const,
    productResolution: 'MATCH_AMBIGUOUS' as const,
  };

  it('estado inicial: sem preview o commit fica desabilitado', () => {
    assert.equal(
      surveyCommitEnabled({ hasPreview: false, busy: false, blockedCount: 0 }),
      false,
    );
  });

  it('linhas UNIQUE não exigem seleção', () => {
    assert.equal(surveyRowNeedsManualResolution(uniqueRow), false);
  });

  it('NOT_FOUND e AMBIGUOUS permitem resolução', () => {
    assert.equal(surveyRowNeedsManualResolution(notFoundRow), true);
    assert.equal(surveyRowNeedsManualResolution(ambiguousRow), true);
  });

  it('escolha monta productKeyMap explícito e UNIQUE automático fica de fora', () => {
    const map = toSurveyProductKeyMap([uniqueRow, notFoundRow, notFoundRow], {
      [notFoundRow.productKey]: 'uuid-ezolem',
    });
    assert.deepEqual(map, [
      {
        tradeName: 'BRASKEM EZOLEM 6/7',
        manufacturer: null,
        chemicalProductId: 'uuid-ezolem',
      },
    ]);
  });

  it('commit só fica disponível quando o preview existe e blockedCount=0', () => {
    assert.equal(
      surveyCommitEnabled({ hasPreview: true, busy: false, blockedCount: 19 }),
      false,
    );
    assert.equal(
      surveyCommitEnabled({ hasPreview: true, busy: true, blockedCount: 0 }),
      false,
    );
    assert.equal(
      surveyCommitEnabled({
        hasPreview: true,
        busy: false,
        blockedCount: 0,
      }),
      true,
    );
  });
});
