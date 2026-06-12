import { FormApplicationBrowseResultModel } from '@v2/models/form/models/form-application/form-application-browse-result.model';
import { ICompany } from 'core/interfaces/api/ICompany';
import { getCompanyName } from 'core/utils/helpers/companyName';

export function getHomeCompanyLabel(company: {
  companyInitials?: string | null;
  companyFantasy?: string | null;
  companyName?: string | null;
}): string | undefined {
  const label = getCompanyName({
    initials: company.companyInitials ?? undefined,
    fantasy: company.companyFantasy ?? undefined,
    name: company.companyName ?? undefined,
  } as ICompany);

  return label || undefined;
}

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

  return getHomeCompanyLabel(application);
}
