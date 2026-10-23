import { sortOverviewRisks } from './exam-risk-overview.util';
import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

const groups = [
  ['ACI', 'Acidente'], ['BIO', 'Biológico'], ['ERG', 'Ergonômico'],
  ['FIS', 'Físico'], ['OUTROS', 'Outros'], ['QUI', 'Químico'],
];
const items = groups.flatMap(([id, name]) => ['Zinco', 'Ácido'].map(riskName => ({
  riskId: `${id}-${riskName}`, riskName, riskGroup: { id, name },
} as ICompanyExamRiskCoverageItem))).reverse();

it.each(['asc', 'desc'] as const)('sorts by the Portuguese type name and then risk name (%s), without mutating the list', direction => {
  const before = items.map(item => item.riskId);
  const expected = groups.flatMap(([id]) => [`${id}-Ácido`, `${id}-Zinco`]);
  if (direction === 'desc') expected.reverse();
  expect(sortOverviewRisks(items, { field: 'riskName', direction }).map(item => item.riskId)).toEqual(expected);
  expect(items.map(item => item.riskId)).toEqual(before);
});
it.each(['asc', 'desc'] as const)('keeps secondary ordering when P/FRO filtering is active (%s)', direction => {
  const filtered = items.filter(item => item.riskGroup.id === 'QUI');
  const expected = ['Ácido', 'Zinco'];
  if (direction === 'desc') expected.reverse();
  expect(sortOverviewRisks(filtered, { field: 'riskName', direction }).map(item => item.riskName)).toEqual(expected);
  expect(sortOverviewRisks(items, { field: 'riskName', direction }).filter(item => item.riskGroup.id === 'QUI')).toEqual(sortOverviewRisks(filtered, { field: 'riskName', direction }));
});
