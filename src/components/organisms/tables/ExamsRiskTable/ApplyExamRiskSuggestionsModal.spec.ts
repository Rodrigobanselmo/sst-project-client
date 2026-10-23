import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreviewTable } from './ApplyExamRiskSuggestionsModal';
jest.mock(
  '@v2/services/medicine/company-exam-risk-suggestions/hooks/useApplyExamRiskSuggestions',
  () => ({
    useApplyExamRiskSuggestions: jest.fn(),
    confirmPreviewedExamRiskSuggestions: jest.fn(),
  }),
);
const proposedConfig = {
  isAdmission: false,
  isPeriodic: false,
  isChange: true,
  isReturn: false,
  isDismissal: false,
  isMale: false,
  isFemale: false,
  fromAge: 0,
  toAge: null,
  validityInMonths: null,
  considerBetweenDays: 0,
  minRiskDegree: null,
  minRiskDegreeQuantity: null,
  configSource: {
    ruleExamRowId: 'item',
    usedCompanyDefaults: false,
    usedCreationDefaults: false,
  },
};
const render = (quantitativeLimitApplicable?: boolean) =>
  renderToStaticMarkup(
    React.createElement(PreviewTable, {
      dryRun: true,
      riskRef: { quantitativeLimitApplicable },
      items: [
        {
          examId: 20,
          riskId: 'risk',
          examName: 'O-cresol',
          status: 'ERROR',
          message: 'Periodicidade inválida: revise o exame.',
          proposedConfig,
        },
      ] as any,
    }),
  );
it('shows the original events, age zero, source and item-specific failure reason', () => {
  const html = render(true);
  expect(html).toContain('Mudança');
  expect(html).toContain('A partir de 0 anos');
  expect(html).toContain('Regra da biblioteca');
  expect(html).toContain('Periodicidade inválida: revise o exame.');
  expect(html).toContain('Não informado');
  expect(html).not.toContain('Padrões PCMSO da empresa');
});
it('uses resolved applicability for the preview, never risk category fallbacks', () => {
  expect(render(false)).toContain('Não aplicável');
  expect(render()).toContain('Elegibilidade não resolvida');
});
