import { UserAccessScopeEnum } from 'core/enums/user-access-scope.enum';
import { ICompany } from 'core/interfaces/api/ICompany';

export function getBusinessGroupMemberCompanies(company: ICompany | null): ICompany[] {
  return company?.group?.companies ?? [];
}

export function hasBusinessGroup(company: ICompany | null): boolean {
  return (
    !!company?.group?.id &&
    !company?.isConsulting &&
    getBusinessGroupMemberCompanies(company).length > 0
  );
}

export function inferUserAccessScope(
  company: ICompany | null,
  linkedCompanyIds: string[],
): UserAccessScopeEnum {
  const groupMemberIds = getBusinessGroupMemberCompanies(company).map((member) => member.id);
  const userInGroupIds = linkedCompanyIds.filter((id) => groupMemberIds.includes(id));

  if (userInGroupIds.length <= 1) {
    return UserAccessScopeEnum.SINGLE;
  }

  if (userInGroupIds.length === groupMemberIds.length) {
    return UserAccessScopeEnum.ALL_GROUP;
  }

  return UserAccessScopeEnum.SELECTED;
}

export function resolveGroupCompaniesForScope(
  scope: UserAccessScopeEnum,
  company: ICompany | null,
  selectedCompanies: ICompany[],
): ICompany[] {
  const groupMembers = getBusinessGroupMemberCompanies(company);

  switch (scope) {
    case UserAccessScopeEnum.ALL_GROUP:
      return groupMembers;
    case UserAccessScopeEnum.SELECTED:
      return selectedCompanies;
    default:
      return company ? [company] : [];
  }
}

export function resolveCompaniesIdsForSubmit(params: {
  scope: UserAccessScopeEnum;
  company: ICompany | null;
  selectedCompanies: ICompany[];
  isEdit: boolean;
  isBusinessGroup: boolean;
}): string[] | undefined {
  const { scope, company, selectedCompanies, isEdit, isBusinessGroup } = params;

  if (!isBusinessGroup) {
    return undefined;
  }

  if (scope === UserAccessScopeEnum.SINGLE) {
    return isEdit && company ? [company.id] : undefined;
  }

  if (scope === UserAccessScopeEnum.ALL_GROUP) {
    return getBusinessGroupMemberCompanies(company).map((member) => member.id);
  }

  if (scope === UserAccessScopeEnum.SELECTED) {
    if (!selectedCompanies.length) {
      return undefined;
    }

    return selectedCompanies.map((member) => member.id);
  }

  return undefined;
}

export function getUserGroupLinkedCompanies(
  company: ICompany | null,
  linkedCompanyIds: string[],
): ICompany[] {
  const groupMembers = getBusinessGroupMemberCompanies(company);
  return groupMembers.filter((member) => linkedCompanyIds.includes(member.id));
}
