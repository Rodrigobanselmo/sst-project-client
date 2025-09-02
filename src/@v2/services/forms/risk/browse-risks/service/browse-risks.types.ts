import { PaginationModel } from '@v2/models/.shared/models/pagination.model';

export interface BrowseRisksFilters {
  search?: string;
}

export interface BrowseRisksParams {
  companyId: string;
  pagination?: {
    page: number;
    limit: number;
  };
  orderBy?: Array<{ field: string; order: string }>;
  filters?: BrowseRisksFilters;
}
