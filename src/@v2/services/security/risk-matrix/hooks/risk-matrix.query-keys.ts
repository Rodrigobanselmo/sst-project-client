export const riskMatrixQueryKeys = {
  all: ['risk-matrices'] as const,
  browse: (companyId: string) =>
    [...riskMatrixQueryKeys.all, 'browse', companyId] as const,
  read: (companyId: string, matrixId: string) =>
    [...riskMatrixQueryKeys.all, 'read', companyId, matrixId] as const,
  version: (companyId: string, matrixId: string, versionId: string) =>
    [
      ...riskMatrixQueryKeys.all,
      'version',
      companyId,
      matrixId,
      versionId,
    ] as const,
  workspace: (companyId: string, workspaceId: string) =>
    [...riskMatrixQueryKeys.all, 'workspace', companyId, workspaceId] as const,
};
