import {
  formatExamRiskQualitativeDegreeLabel,
  formatExamRiskQuantitativeDegreeLabel,
} from './exam-risk-degree-display.util';

describe('exam-risk-degree-display.util', () => {
  it('mostra Não aplicável para ERG sem parâmetro quantitativo', () => {
    expect(
      formatExamRiskQuantitativeDegreeLabel(4, {
        type: 'ERG' as never,
        esocialCode: null,
      }),
    ).toBe('Não aplicável');
  });

  it('mostra label para ruído quantitativo', () => {
    expect(
      formatExamRiskQuantitativeDegreeLabel(4, {
        type: 'FIS' as never,
        esocialCode: '02.01.001',
      }),
    ).toBe('Alto');
  });

  it('mostra traço para qualitativo vazio', () => {
    expect(formatExamRiskQualitativeDegreeLabel(null)).toBe('-');
  });
});
