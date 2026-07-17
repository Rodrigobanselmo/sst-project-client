export const chemicalProductQueryKeys = {
  all: ['chemical-products'] as const,
  browse: (params: {
    companyId: string;
    workspaceId: string;
    includeArchived?: boolean;
    search?: string;
  }) => [...chemicalProductQueryKeys.all, 'browse', params] as const,
  read: (params: {
    companyId: string;
    workspaceId: string;
    productId: string;
  }) => [...chemicalProductQueryKeys.all, 'read', params] as const,
};
