import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskDeleteLink } from './ExamRiskDeleteLink';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { loadInlineRiskLinks } from './exam-risk-inline-parameter.util';
import { useMutDeleteExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk';
let mockButton: any;
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock('./exam-risk-inline-parameter.util', () => ({
  loadInlineRiskLinks: jest.fn(),
}));
jest.mock(
  'core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk',
  () => ({ useMutDeleteExamRisk: jest.fn() }),
);
jest.mock('@mui/material', () => ({
  IconButton: (p: any) => {
    mockButton = p;
    return React.createElement('button', { 'aria-label': p['aria-label'] });
  },
  Tooltip: ({ children }: any) => children,
  Typography: ({ children }: any) =>
    React.createElement('span', null, children),
}));
const scope = {
  companyId: 'company',
  workspaceId: 'workspace',
  riskId: 'risk',
  riskName: 'Altura',
};
const link = {
  id: 574,
  examId: 12,
  riskId: 'risk',
  companyId: 'company',
} as any;
const mutateAsync = jest.fn();
const render = (patch = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskDeleteLink, {
      scope,
      link,
      examId: 12,
      examName: 'Proteína C',
      ...patch,
    }),
  );
const flush = () => new Promise((resolve) => setImmediate(resolve));
beforeEach(() => {
  jest.clearAllMocks();
  (global as any).window = { confirm: jest.fn(() => true) };
  (useAuthShow as jest.Mock).mockReturnValue({
    isAuthSuccess: ({ cruds }: any) => cruds === 'd',
  });
  (useMutDeleteExamRisk as jest.Mock).mockReturnValue({
    mutateAsync,
    isLoading: false,
  });
  (loadInlineRiskLinks as jest.Mock).mockResolvedValue([link]);
  mutateAsync.mockResolvedValue(link);
});
afterEach(() => delete (global as any).window);
it('requires delete permission and a matching owned link', () => {
  expect(render()).toContain('vínculo 574');
  expect(render({ link: undefined })).toBe('');
  expect(render({ link: { ...link, companyId: 'consultant' } })).toBe('');
  expect(render({ link: { ...link, riskId: 'other' } })).toBe('');
  expect(render({ link: { ...link, examId: 99 } })).toBe('');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
  expect(render()).toBe('');
});
it.each([1, 2])(
  'cancelling confirmation %s performs no reads or writes',
  async (stage) => {
    (window.confirm as jest.Mock)
      .mockReturnValueOnce(stage === 2)
      .mockReturnValueOnce(false);
    render();
    mockButton.onClick({ stopPropagation: jest.fn() });
    await flush();
    expect(window.confirm).toHaveBeenCalledTimes(stage);
    expect(loadInlineRiskLinks).not.toHaveBeenCalled();
    expect(mutateAsync).not.toHaveBeenCalled();
  },
);
it('confirms twice and deletes exclusively the displayed ID among multiple links, blocking repeats', async () => {
  (loadInlineRiskLinks as jest.Mock).mockResolvedValue([
    { ...link, id: 573 },
    link,
  ]);
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(window.confirm).toHaveBeenCalledTimes(2);
  expect((window.confirm as jest.Mock).mock.calls[1][0]).toContain('574');
  expect(mutateAsync).toHaveBeenCalledTimes(1);
  expect(mutateAsync).toHaveBeenCalledWith({ id: 574, companyId: 'company' });
});
it('blocks a link that is no longer owned or available on revalidation', async () => {
  (loadInlineRiskLinks as jest.Mock).mockResolvedValue([
    { ...link, companyId: 'consultant' },
  ]);
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(mutateAsync).not.toHaveBeenCalled();
});
it('handles deletion failure without further writes and permits retry', async () => {
  mutateAsync.mockRejectedValue(new Error('failed'));
  render();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  mockButton.onClick({ stopPropagation: jest.fn() });
  await flush();
  expect(mutateAsync).toHaveBeenCalledTimes(2);
});
