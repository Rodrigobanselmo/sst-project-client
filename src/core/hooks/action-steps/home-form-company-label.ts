import { FormApplicationBrowseResultModel } from '@v2/models/form/models/form-application/form-application-browse-result.model';
import { ICompany } from 'core/interfaces/api/ICompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

export function getHomeFormCompanyLabel(
  application: FormApplicationBrowseResultModel,
  options: {
    isGroupConsolidated: boolean;
    businessGroupName?: string | null;
  },
): string | undefined {
  if (!options.isGroupConsolidated) return undefined;

  if (application.isBusinessGroupApplication) {
    return options.businessGroupName ?? undefined;
  }

  const label = getCompanyName({
    initials: application.companyInitials ?? undefined,
    fantasy: application.companyFantasy ?? undefined,
    name: application.companyName ?? undefined,
  } as ICompany);

  return label || undefined;
}
