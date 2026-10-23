import { useMutDeleteExamRisk } from './useMutDeleteExamRisk';
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
jest.mock('core/services/apiClient', () => ({ api: { delete: jest.fn() } }));
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
  useMutDeleteExamRisk();
});
it('uses only the existing link delete endpoint and ID', async () => {
  (api.delete as jest.Mock).mockResolvedValue({ data: { id: 574 } });
  await mockMutation({ id: 574, companyId: 'company' });
  expect(api.delete).toHaveBeenCalledWith('/exam/risk/574/company');
});
it('refreshes legacy lists, inline links, coverage/cards and reviews from the mutation shared by both entry points', async () => {
  await mockOptions.onSuccess({ id: 574 });
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
  expect(mockSnackbar).toHaveBeenCalledWith('Removido com sucesso', {
    variant: 'success',
  });
});
it('distinguishes a successful deletion with refresh failure from delete failure', async () => {
  mockInvalidate.mockRejectedValue(new Error('refresh failed'));
  await expect(mockOptions.onSuccess({ id: 574 })).resolves.toEqual({
    id: 574,
  });
  expect(mockSnackbar).toHaveBeenCalledWith(
    expect.stringContaining('Vínculo removido'),
    { variant: 'warning' },
  );
  expect(mockSnackbar).not.toHaveBeenCalledWith(
    'Removido com sucesso',
    expect.anything(),
  );
});
it('reports delete errors without success or coverage mutation', () => {
  mockOptions.onError({ response: { data: { message: 'Sem permissão' } } });
  expect(mockSnackbar).toHaveBeenCalledWith('Sem permissão', {
    variant: 'error',
  });
  expect(mockInvalidate).not.toHaveBeenCalled();
});
