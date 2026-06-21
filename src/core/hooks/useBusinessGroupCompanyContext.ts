import { useMemo } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';

/**
 * GET /company/:id retorna group.id, mas não inclui group.companies.
 * Este hook complementa os membros do grupo via GET /company?groupId=...
 */
export function useBusinessGroupCompanyContext(
  company: ICompany | null | undefined,
) {
  const businessGroupId = company?.group?.id ?? null;
  const shouldFetchGroupMembers =
    !!company?.id && !!businessGroupId && !company?.isConsulting;

  const { companies: groupMemberCompanies = [], isLoading: isLoadingGroupMembers } =
    useQueryCompanies(
      1,
      {
        ...(shouldFetchGroupMembers && businessGroupId
          ? { groupId: businessGroupId }
          : {}),
        disabled: !shouldFetchGroupMembers,
      },
      400,
    );

  const companyWithGroup = useMemo(() => {
    if (!company?.id) return null;

    if (!businessGroupId) return company;

    const members =
      groupMemberCompanies.length > 0
        ? groupMemberCompanies
        : (company.group?.companies ?? []);

    if (!members.length) return company;

    return {
      ...company,
      group: {
        ...(company.group ?? { id: businessGroupId }),
        id: businessGroupId,
        companies: members,
      },
    } as ICompany;
  }, [businessGroupId, company, groupMemberCompanies]);

  const isBusinessGroup = shouldFetchGroupMembers;

  return {
    companyWithGroup,
    isBusinessGroup,
    groupMemberCompanies,
    isLoadingGroupMembers: shouldFetchGroupMembers && isLoadingGroupMembers,
    businessGroupId,
    hasLoadedGroupMembers: groupMemberCompanies.length > 0,
  };
}
