import { useMutBulkUpdateExamRisk } from './useMutBulkUpdateExamRisk';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
let mockOptions: any, mockMutation: any;
const mockInvalidate = jest.fn();
const mockSnackbar = jest.fn();
jest.mock('react-query', () => ({
  useMutation: (mutation: any, options: any) => {
    mockMutation = mutation;
    mockOptions = options;
    return { mutateAsync: mutation };
  },
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockSnackbar }),
}));
jest.mock('core/hooks/useGetCompanyId', () => ({
  useGetCompanyId: () => ({ getCompanyId: (id: string) => id }),
}));
jest.mock('core/services/apiClient', () => ({ api: { post: jest.fn() } }));
jest.mock('core/services/queryClient', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
jest.mock(
  '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status',
  () => ({ refetchExamRiskLinkStatusQueries: jest.fn() }),
);
beforeEach(() => {
  jest.clearAllMocks();
  mockInvalidate.mockResolvedValue(undefined);
  useMutBulkUpdateExamRisk();
});
it('sends exact link IDs and only the marked patch to the existing endpoint', async () => {
  (api.post as jest.Mock).mockResolvedValue({ data: { count: 2 } });
  const patch = { isMale: false, fromAge: null, validityInMonths: 0 };
  await mockMutation({ ids: [1, 2], companyId: 'company', patch });
  expect(api.post).toHaveBeenCalledWith('/exam/risk/bulk/update/company', {
    ids: [1, 2],
    companyId: 'company',
    patch,
  });
});
it('refreshes lists, ownership, coverage, comparisons and parameter reviews', async () => {
  await mockOptions.onSuccess({ count: 2 });
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith([
    QueryEnum.EXAMS_RISK,
  ]);
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith([
    QueryEnum.EXAMS_RISK_DATA,
  ]);
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith([
    'exam-risk-inline-links',
  ]);
  expect(refetchExamRiskLinkStatusQueries).toHaveBeenCalled();
  expect(mockInvalidate).toHaveBeenCalledWith(
    { queryKey: ['company-exam-risk-coverage'] },
    { throwOnError: true },
  );
  expect(mockInvalidate).toHaveBeenCalledWith(
    { queryKey: ['exam-risk-parameter-reviews'] },
    { throwOnError: true },
  );
});
it('preserves the explicit post-processing warning and does not announce full success', async () => {
  await mockOptions.onSuccess({ count: 2, warning: 'Empregados pendentes' });
  expect(mockSnackbar).toHaveBeenCalledWith('Empregados pendentes', {
    variant: 'warning',
  });
  expect(mockSnackbar).not.toHaveBeenCalledWith(expect.anything(), {
    variant: 'success',
  });
});
it('does not turn a committed update with refresh failure into a retryable mutation failure', async () => {
  mockInvalidate.mockRejectedValue(new Error('refresh'));
  await expect(mockOptions.onSuccess({ count: 2 })).resolves.toEqual({
    count: 2,
  });
  expect(mockSnackbar).toHaveBeenCalledWith(
    expect.stringContaining('atualizar todos'),
    { variant: 'warning' },
  );
  expect(mockSnackbar).not.toHaveBeenCalledWith(expect.anything(), {
    variant: 'success',
  });
});
it('reports validation errors without success', () => {
  mockOptions.onError({
    response: { status: 400, data: { message: 'Vínculo inválido' } },
  });
  expect(mockSnackbar).toHaveBeenCalledWith('Vínculo inválido', {
    variant: 'error',
  });
  expect(mockInvalidate).not.toHaveBeenCalled();
});
