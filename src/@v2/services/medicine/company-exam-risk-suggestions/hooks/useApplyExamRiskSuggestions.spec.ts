import { confirmPreviewedExamRiskSuggestions } from './useApplyExamRiskSuggestions';
jest.mock('../company-exam-risk-suggestions.service', () => ({
  applyExamRiskSuggestions: jest.fn(),
}));
const params = {
  companyId: 'company',
  riskId: 'risk',
  workspaceId: 'workspace',
  examIds: [20, 21],
  dryRun: false,
  expectedPreviewFingerprint: 'a'.repeat(64),
};
it('confirms exactly the selected IDs and preview token, refreshing after created rows', async () => {
  const result = { summary: { created: 2, errors: 0 } } as any;
  const apply = jest.fn(async () => result);
  const refresh = jest.fn();
  expect(
    await confirmPreviewedExamRiskSuggestions(apply, params, refresh),
  ).toBe(result);
  expect(apply).toHaveBeenCalledWith(params);
  expect(refresh).toHaveBeenCalledTimes(1);
});
it('refreshes after a reported partial result, without treating errors as complete success', async () => {
  const result = { summary: { created: 1, errors: 1 } } as any;
  const refresh = jest.fn();
  const response = await confirmPreviewedExamRiskSuggestions(
    async () => result,
    params,
    refresh,
  );
  expect(response.summary.errors).toBe(1);
  expect(refresh).toHaveBeenCalledTimes(1);
});
it('refreshes on stale version and uncertain failure; propagates the failure for the modal', async () => {
  for (const error of [
    { response: { status: 409 } },
    new Error('network failure'),
  ]) {
    const refresh = jest.fn();
    await expect(
      confirmPreviewedExamRiskSuggestions(
        async () => {
          throw error;
        },
        params,
        refresh,
      ),
    ).rejects.toBe(error);
    expect(refresh).toHaveBeenCalledTimes(1);
  }
});
it('does not confirm without a preview and refreshes a completed result even without new writes', async () => {
  const apply = jest.fn(
    async () => ({ summary: { created: 0, errors: 2 } }) as any,
  );
  const refresh = jest.fn();
  await expect(
    confirmPreviewedExamRiskSuggestions(
      apply,
      { ...params, expectedPreviewFingerprint: undefined },
      refresh,
    ),
  ).rejects.toThrow('prévia');
  expect(apply).not.toHaveBeenCalled();
  await confirmPreviewedExamRiskSuggestions(apply, params, refresh);
  expect(refresh).toHaveBeenCalledTimes(1);
});
