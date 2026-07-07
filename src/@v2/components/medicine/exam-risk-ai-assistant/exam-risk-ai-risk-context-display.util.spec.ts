import {
  formatExamRiskAiRiskCategoryChipLabel,
  formatExamRiskAiRiskCategoryLine,
  formatExamRiskAiRiskMetadataLine,
  formatExamRiskAiRiskSubTypesLine,
} from './exam-risk-ai-risk-context-display.util';

describe('exam-risk-ai-risk-context-display.util', () => {
  it('renderiza categoria e subtipo quando disponíveis', () => {
    expect(
      formatExamRiskAiRiskCategoryLine({
        riskType: 'ACI',
        riskTypeLabel: 'Acidente',
      }),
    ).toBe('Categoria: Acidente (ACI)');

    expect(
      formatExamRiskAiRiskCategoryChipLabel({
        riskType: 'ACI',
        riskTypeLabel: 'Acidente',
      }),
    ).toBe('Acidente (ACI)');

    expect(
      formatExamRiskAiRiskSubTypesLine([{ id: 1, name: 'Contato térmico' }]),
    ).toBe('Subtipo: Contato térmico');
  });

  it('omite subtipo quando não informado', () => {
    expect(formatExamRiskAiRiskSubTypesLine([])).toBeNull();
    expect(formatExamRiskAiRiskSubTypesLine(undefined)).toBeNull();
  });

  it('formata CAS e eSocial quando disponíveis', () => {
    expect(
      formatExamRiskAiRiskMetadataLine({
        riskCas: '7439-92-1',
        riskEsocialCode: '01.01.001',
      }),
    ).toBe('CAS: 7439-92-1 · eSocial: 01.01.001');
  });
});
