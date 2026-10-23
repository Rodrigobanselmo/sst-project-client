import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskOverviewEditLink } from './ExamRiskOverviewEditLink';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { queryExams } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';
let mockButton: any;
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock(
  'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk',
  () => ({ queryExams: jest.fn() }),
);
jest.mock('@mui/material', () => ({
  Box: ({ children }: any) => React.createElement('span', null, children),
  Typography: ({ children }: any) =>
    React.createElement('span', null, children),
  CircularProgress: () => null,
  ButtonBase: (props: any) => {
    mockButton = props;
    return React.createElement(
      'button',
      { 'aria-label': props['aria-label'] },
      props.children,
    );
  },
}));
const exam = {
  examId: 12,
  linkId: 333,
  examName: 'Espirometria',
  isLocalOnly: true,
} as any;
const onEdit = jest.fn();
const render = (overrides = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskOverviewEditLink, {
      companyId: 'company',
      workspaceId: 'workspace',
      riskId: 'risk',
      riskName: 'Manganês',
      exam,
      iconOnly: true,
      onEdit,
      ...overrides,
    }),
  );
beforeEach(() => {
  jest.clearAllMocks();
  mockButton = undefined;
  (useAuthShow as jest.Mock).mockReturnValue({
    isAuthSuccess: ({ cruds }: any) => cruds === 'u',
  });
});
it('renders the pencil for update permission including local adopted exams', () => {
  expect(render()).toContain('Editar Espirometria, vínculo 333');
  expect(useAuthShow().isAuthSuccess({ cruds: 'u' } as any)).toBe(true);
});
it('hides the pencil without update permission or an adopted link', () => {
  expect(render({ exam: { ...exam, linkId: undefined } })).toBe('');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
  expect(render()).toBe('');
});
it('loads the exact complete record and forwards the existing ID and all parameters without defaults', async () => {
  const link = {
    id: 333,
    examId: 12,
    riskId: 'risk',
    companyId: 'company',
    risk: { id: 'risk' },
    exam: { id: 12 },
    validityInMonths: 24,
    considerBetweenDays: 0,
    isReturn: false,
    minRiskDegreeQuantity: null,
  };
  (queryExams as jest.Mock).mockResolvedValue({
    data: [{ ...link, id: 332 }, link],
    count: 2,
  });
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  mockButton.onClick({ stopPropagation: jest.fn() });
  await new Promise((resolve) => setImmediate(resolve));
  expect(queryExams).toHaveBeenCalledTimes(1);
  expect(queryExams).toHaveBeenCalledWith(
    { skip: 0, take: 100 },
    { companyId: 'company', workspaceId: 'workspace', riskNames: ['Manganês'] },
  );
  expect(onEdit).toHaveBeenCalledTimes(1);
  expect(onEdit).toHaveBeenCalledWith(link);
});
it('does not open a different exam or risk even when the link ID matches', async () => {
  (queryExams as jest.Mock).mockResolvedValue({
    data: [
      { id: 333, examId: 99, riskId: 'risk' },
      { id: 333, examId: 12, riskId: 'other' },
    ],
    count: 2,
  });
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await new Promise((resolve) => setImmediate(resolve));
  expect(onEdit).not.toHaveBeenCalled();
});
