import {
  formatActionPlanGroupRiskCount,
  uniqueActionPlanGroupRisks,
} from './unique-action-plan-group-risks';

describe('uniqueActionPlanGroupRisks', () => {
  it('lists every distinct risk name without truncating the data', () => {
    const risks = uniqueActionPlanGroupRisks([
      { id: 'a', name: 'Trabalho em ambientes com risco de soterramento' },
      { id: 'a', name: 'duplicado' },
      { id: 'b', name: 'Trabalho em ambientes com risco de afogamento' },
    ]);

    expect(risks).toHaveLength(2);
    expect(risks.map((risk) => risk.name)).toEqual([
      'Trabalho em ambientes com risco de soterramento',
      'Trabalho em ambientes com risco de afogamento',
    ]);
    expect(formatActionPlanGroupRiskCount(risks.length)).toBe('2 fatores de risco');
  });
});
