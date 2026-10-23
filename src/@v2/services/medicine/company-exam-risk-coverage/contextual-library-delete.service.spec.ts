import { api } from 'core/services/apiClient';
import {
  fetchLibraryDeletionEligibility,
  deleteContextualLibraryRecommendation,
} from './contextual-library-delete.service';
jest.mock('core/services/apiClient', () => ({
  api: { get: jest.fn(), delete: jest.fn() },
}));
it('uses the contextual route with the exact risk, item, exam and timestamps', async () => {
  const params = {
    companyId: 'company',
    riskId: 'risk',
    ruleId: 'rule',
    ruleExamId: 'item',
    workspaceId: 'workspace',
    examId: 197,
    expectedRuleUpdatedAt: '2026-10-22T00:00:00Z',
    expectedItemUpdatedAt: '2026-10-22T00:00:00Z',
  };
  const query = {
    workspaceId: 'workspace',
    examId: 197,
    expectedRuleUpdatedAt: params.expectedRuleUpdatedAt,
    expectedItemUpdatedAt: params.expectedItemUpdatedAt,
  };
  (api.get as jest.Mock).mockResolvedValue({
    data: { eligible: true, reason: 'ok' },
  });
  (api.delete as jest.Mock).mockResolvedValue({ data: { deleted: true } });
  await expect(fetchLibraryDeletionEligibility(params)).resolves.toMatchObject({
    eligible: true,
  });
  await expect(
    deleteContextualLibraryRecommendation(params),
  ).resolves.toMatchObject({ deleted: true });
  expect(api.get).toHaveBeenCalledWith(
    '/v2/companies/company/risks/risk/library-recommendations/rule/exams/item/deletion-eligibility',
    { params: query },
  );
  expect(api.delete).toHaveBeenCalledWith(
    '/v2/companies/company/risks/risk/library-recommendations/rule/exams/item',
    { params: query },
  );
});
