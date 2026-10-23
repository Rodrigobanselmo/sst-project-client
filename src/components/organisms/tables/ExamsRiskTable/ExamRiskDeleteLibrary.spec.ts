import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskDeleteLibrary } from './ExamRiskDeleteLibrary';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { deleteContextualLibraryRecommendation } from '@v2/services/medicine/company-exam-risk-coverage/contextual-library-delete.service';
let mockButton: any;
let mockEligibility: any;
let mockQueryOptions: any;
const mockInvalidate = jest.fn();
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => {
    mockQueryOptions = options;
    return mockEligibility;
  },
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));
jest.mock(
  '@v2/services/medicine/company-exam-risk-coverage/contextual-library-delete.service',
  () => ({
    deleteContextualLibraryRecommendation: jest.fn(),
    fetchLibraryDeletionEligibility: jest.fn(),
  }),
);
jest.mock('@mui/material', () => ({
  Tooltip: ({ children }: any) => children,
  Typography: ({ children }: any) =>
    React.createElement('span', null, children),
  IconButton: (props: any) => {
    mockButton = props;
    return React.createElement('button', { 'aria-label': props['aria-label'] });
  },
}));
const scope = {
  companyId: 'company',
  workspaceId: 'workspace',
  riskId: 'height',
  riskName: 'Trabalho em altura',
};
const exam = {
  examId: 197,
  examName: 'Proteína C',
  recommendationSource: {
    ruleId: 'rule',
    ruleExamId: 'item',
    ruleUpdatedAt: '2026-10-22T00:00:00.000Z',
    itemUpdatedAt: '2026-10-22T00:00:00.000Z',
  },
} as any;
const onSaved = jest.fn();
const render = (patch = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskDeleteLibrary, {
      scope,
      exam,
      onSaved,
      ...patch,
    }),
  );
const flush = () => new Promise((resolve) => setImmediate(resolve));
beforeEach(() => {
  jest.clearAllMocks();
  (global as any).window = { confirm: jest.fn(() => true) };
  (useAuthShow as jest.Mock).mockReturnValue({ isMasterAdmin: true });
  mockEligibility = {
    data: { eligible: true, reason: 'ok' },
    refetch: jest.fn(),
  };
  mockInvalidate.mockResolvedValue(undefined);
  onSaved.mockResolvedValue(undefined);
  (deleteContextualLibraryRecommendation as jest.Mock).mockResolvedValue({
    deleted: true,
  });
});
afterEach(() => delete (global as any).window);
it('requires MASTER, provenance and backend eligibility', () => {
  expect(render()).toContain('Excluir recomendação da Biblioteca: Proteína C');
  expect(render({ exam: undefined })).toBe('');
  expect(render({ exam: { ...exam, recommendationSource: null } })).toBe('');
  mockEligibility.data = { eligible: false, reason: 'Regra compartilhada' };
  expect(render()).not.toContain('button');
  expect(render()).not.toContain('Regra compartilhada');
  mockEligibility.isError = true;
  expect(render()).toBe('');
  (useAuthShow as jest.Mock).mockReturnValue({ isMasterAdmin: false });
  expect(render()).toBe('');
  expect(mockQueryOptions.enabled).toBe(false);
});
it.each([1, 2])('cancels at confirmation %s without writes', async (stage) => {
  (window.confirm as jest.Mock)
    .mockReturnValueOnce(stage === 2)
    .mockReturnValueOnce(false);
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(window.confirm).toHaveBeenCalledTimes(stage);
  expect(deleteContextualLibraryRecommendation).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});
it('uses the exact identity and versions, prevents duplicates and refreshes comparison and administrative cache', async () => {
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(deleteContextualLibraryRecommendation).toHaveBeenCalledTimes(1);
  expect(deleteContextualLibraryRecommendation).toHaveBeenCalledWith({
    companyId: 'company',
    workspaceId: 'workspace',
    riskId: 'height',
    ruleId: 'rule',
    ruleExamId: 'item',
    examId: 197,
    expectedRuleUpdatedAt: exam.recommendationSource.ruleUpdatedAt,
    expectedItemUpdatedAt: exam.recommendationSource.itemUpdatedAt,
  });
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['exam-risk-rule'] });
});
it('does not announce success on delete failure and refreshes stale data on conflict', async () => {
  (deleteContextualLibraryRecommendation as jest.Mock).mockRejectedValue({
    response: { status: 409, data: { message: 'Alterado' } },
  });
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(onSaved).toHaveBeenCalled();
  expect(mockEligibility.refetch).toHaveBeenCalled();
  expect(mockInvalidate).not.toHaveBeenCalled();
});
it('does not refresh as success when the response does not confirm deletion', async () => {
  (deleteContextualLibraryRecommendation as jest.Mock).mockResolvedValue({
    deleted: false,
  });
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(onSaved).not.toHaveBeenCalled();
});

it('keeps action feedback visible without showing automatic eligibility reasons', () => {
 mockEligibility.data = { eligible: false, reason: 'Utilize a curadoria administrativa' };
 const state = jest.spyOn(React, 'useState')
   .mockImplementationOnce(() => [false, jest.fn()] as any)
   .mockImplementationOnce(() => ['A recomendação mudou. Atualize a comparação.', jest.fn()] as any);
 try {
  const html = render();
  expect(html).toContain('A recomendação mudou. Atualize a comparação.');
  expect(html).not.toContain('Utilize a curadoria administrativa');
 } finally { state.mockRestore(); }
});
