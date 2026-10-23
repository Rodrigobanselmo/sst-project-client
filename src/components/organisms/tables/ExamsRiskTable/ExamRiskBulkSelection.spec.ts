import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  eligibleBulkLinks,
  visibleBulkLinks,
  ExamRiskBulkCheckbox,
  ExamRiskBulkContext,
} from './ExamRiskBulkSelection';
jest.mock('./exam-risk-inline-parameter.util', () => ({
  loadInlineRiskLinks: jest.fn(),
}));
jest.mock('react-query', () => ({ useQuery: () => ({}) }));
const links = [
  { id: 1, examId: 12, companyId: 'company', riskId: 'a' },
  { id: 2, examId: 12, companyId: 'company', riskId: 'b' },
  { id: 3, examId: 12, companyId: 'consultant', riskId: 'a' },
  { id: 4, examId: 12, riskId: 'a' },
  {
    id: 5,
    examId: 12,
    companyId: 'company',
    deletedAt: 'deleted',
    riskId: 'a',
  },
] as any;
it('selects real IDs separately for repeated exams and excludes inherited, unknown ownership, deleted and unloaded links', () => {
  expect(
    eligibleBulkLinks(links, 'company', [1, 2, 3, 4, 5, 999]).map(
      (link) => link.id,
    ),
  ).toEqual([1, 2]);
  expect(
    eligibleBulkLinks(links, 'company', [2]).map((link) => link.id),
  ).toEqual([2]);
});
it('renders selection exclusively for eligible corporate link IDs', () => {
  const value = {
    selected: [2],
    eligibleIds: [1, 2],
    toggle: jest.fn(),
    register: jest.fn(),
  };
  const html = renderToStaticMarkup(
    React.createElement(
      ExamRiskBulkContext.Provider,
      { value },
      [1, 2, 3].map((linkId) =>
        React.createElement(ExamRiskBulkCheckbox, {
          key: linkId,
          linkId,
          examName: 'Mesmo exame',
        }),
      ),
    ),
  );
  expect(html).toContain('Selecionar vínculo 1');
  expect(html).toContain('Selecionar vínculo 2');
  expect(html).not.toContain('Selecionar vínculo 3');
  expect(html.match(/checked=""/g)).toHaveLength(1);
});
it('does not expose bulk selection outside the permission-gated provider', () => {
  expect(
    renderToStaticMarkup(
      React.createElement(ExamRiskBulkCheckbox, {
        linkId: 1,
        examName: 'Exame',
      }),
    ),
  ).toBe('');
});

it('selects only links currently loaded and visible after P/FRO and coverage filters', () => {
  const loaded = { a: [links[0]], b: [links[1]] };
  const risks = [
    { riskId: 'a', riskGroup: { id: 'QUI' } },
    { riskId: 'b', riskGroup: { id: 'FIS' } },
  ];
  expect(visibleBulkLinks(loaded, risks, '').map((link) => link.id)).toEqual([
    1, 2,
  ]);
  expect(visibleBulkLinks(loaded, risks, 'FIS').map((link) => link.id)).toEqual(
    [2],
  );
  expect(
    visibleBulkLinks(loaded, risks.slice(0, 1), '').map((link) => link.id),
  ).toEqual([1]);
  expect(visibleBulkLinks({ a: [] }, risks, '')).toEqual([]);
});
