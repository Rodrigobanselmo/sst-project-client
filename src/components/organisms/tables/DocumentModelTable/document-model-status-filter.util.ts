import { StatusEnum } from 'project/enum/status.enum';

import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';

export type DocumentModelStatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

/**
 * Builds list query params for the admin document-model screen.
 * Operational selectors must omit showInactive (ACTIVE-only by API default).
 */
export function buildDocumentModelStatusQuery(
  statusFilter: DocumentModelStatusFilter,
): Pick<IQueryDocumentModels, 'showInactive' | 'status'> {
  if (statusFilter === 'ACTIVE') {
    return {};
  }

  if (statusFilter === 'INACTIVE') {
    return {
      showInactive: true,
      status: StatusEnum.INACTIVE,
    };
  }

  return { showInactive: true };
}

export function documentModelStatusEmptyMessage(
  statusFilter: DocumentModelStatusFilter,
): string {
  if (statusFilter === 'INACTIVE') {
    return 'Nenhum modelo inativo encontrado.';
  }
  if (statusFilter === 'ACTIVE') {
    return 'Nenhum modelo ativo encontrado.';
  }
  return 'Nenhum modelo encontrado.';
}
