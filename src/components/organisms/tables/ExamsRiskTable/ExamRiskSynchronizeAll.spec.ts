import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskSynchronizeAll } from './ExamRiskSynchronizeAll';
import { useMutation } from 'react-query';
import { api } from 'core/services/apiClient';
import { useAuthShow } from 'components/molecules/SAuthShow';
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock('react-query', () => ({
  useIsMutating: () => 0,
  useMutation: jest.fn(() => ({ mutate: jest.fn() })),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { quantitativeLimitApplicable: false } }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock('core/services/apiClient', () => ({
  api: { get: jest.fn(), patch: jest.fn() },
}));
jest.mock(
  'core/services/hooks/mutations/checklist/exams/useMutUpdateExamRisk/useMutUpdateExamRisk',
  () => ({ updateExam: jest.fn() }),
);
jest.mock(
  'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk',
  () => ({ queryExams: jest.fn() }),
);
const props = {
  quantitativeLimitApplicable: true,
  scope: { companyId: 'company', riskId: 'risk', riskName: 'Ruído' },
  recommended: {
    examId: 69,
    config: {},
    recommendationSource: { ruleId: 'rule', ruleExamId: 'item' },
  },
  adopted: { examId: 12, linkId: 283, config: {} },
  link: {
    id: 283,
    examId: 12,
    riskId: 'risk',
    companyId: 'company',
    risk: { quantitativeLimitApplicable: true },
  },
  groups: ['minRiskDegree'],
  onSaved: jest.fn(),
} as any;
const render = (overrides = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskSynchronizeAll, {
      ...props,
      destination: 'company',
      ...overrides,
    }),
  );
beforeEach(() => {
  (useAuthShow as jest.Mock).mockReturnValue({
    isMasterAdmin: true,
    isAuthSuccess: () => true,
  });
});
it('oferece as duas direções ao MASTER', () => {
  expect(render()).toContain('Sincronizar tudo');
  expect(render({ destination: 'library' })).toContain('Sincronizar tudo');
});
it('empresa sem MASTER só recebe a direção empresarial', () => {
  (useAuthShow as jest.Mock).mockReturnValue({
    isMasterAdmin: false,
    isAuthSuccess: () => true,
  });
  expect(render()).toContain('Sincronizar tudo');
  expect(render({ destination: 'library' })).toBe('');
});
it('sem permissão não recebe ação', () => {
  (useAuthShow as jest.Mock).mockReturnValue({
    isMasterAdmin: false,
    isAuthSuccess: () => false,
  });
  expect(render()).toBe('');
});
it('oculta sem divergências, proveniência ou vínculo próprio', () => {
  expect(render({ groups: [] })).toBe('');
  expect(render({ recommended: { config: {} } })).toBe('');
  expect(render({ link: { ...props.link, companyId: 'consultoria' } })).toBe(
    '',
  );
});
it('não libera quantitativo da Biblioteca quando não aplicável', () => {
  expect(
    render({ destination: 'library', groups: ['minRiskDegreeQuantity'] }),
  ).toBe('');
});

it('Biblioteca mantém CAS por grupo e usa a versão retornada pela gravação anterior', async () => {
  const config = { minRiskDegree: 4, considerBetweenDays: 90 };
  const get = api.get as jest.Mock;
  const patch = api.patch as jest.Mock;
  get
    .mockResolvedValueOnce({
      data: { updated_at: 'r1', exams: [{ id: 'item', updated_at: 'i1' }] },
    })
    .mockResolvedValueOnce({
      data: { updated_at: 'r2', exams: [{ id: 'item', updated_at: 'i2' }] },
    });
  patch
    .mockResolvedValueOnce({ data: { id: 'item', updated_at: 'i2' } })
    .mockResolvedValueOnce({ data: { id: 'item', updated_at: 'i3' } });
  render({
    destination: 'library',
    groups: ['minRiskDegree', 'considerBetweenDays'],
    recommended: {
      ...props.recommended,
      config,
      recommendationSource: {
        ruleId: 'rule',
        ruleExamId: 'item',
        ruleUpdatedAt: 'r1',
        itemUpdatedAt: 'i1',
      },
    },
    adopted: {
      ...props.adopted,
      config: { minRiskDegree: 3, considerBetweenDays: 0 },
    },
  });
  await (useMutation as jest.Mock).mock.calls.slice(-1)[0][0]();
  expect(patch.mock.calls.slice(-2).map((call) => call[1])).toEqual([
    {
      group: 'minRiskDegree',
      expectedRuleUpdatedAt: 'r1',
      expectedItemUpdatedAt: 'i1',
      patch: { minRiskDegree: 3 },
    },
    {
      group: 'considerBetweenDays',
      expectedRuleUpdatedAt: 'r2',
      expectedItemUpdatedAt: 'i2',
      patch: { considerBetweenDays: 0 },
    },
  ]);
  expect(props.onSaved).toHaveBeenCalled();
});

it.each([false, undefined])(
  'blocks quantitative synchronization in both directions for risk eligibility %s',
  (eligibility) => {
    expect(
      render({
        groups: ['minRiskDegreeQuantity'],
        quantitativeLimitApplicable: eligibility,
      }),
    ).toBe('');
    expect(
      render({
        destination: 'library',
        groups: ['minRiskDegreeQuantity'],
        quantitativeLimitApplicable: eligibility,
      }),
    ).toBe('');
    expect(
      render({
        groups: ['minRiskDegree', 'minRiskDegreeQuantity'],
        quantitativeLimitApplicable: eligibility,
      }),
    ).toContain('Sincronizar tudo');
  },
);
