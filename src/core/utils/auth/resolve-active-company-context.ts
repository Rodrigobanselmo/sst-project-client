import { IUser } from 'core/interfaces/api/IUser';

type ActiveCompanyContext = {
  companyId?: string;
  permissions: string[];
  roles: string[];
};

export function resolveActiveCompanyContext(
  user: Partial<IUser> | null | undefined,
  overrides?: Partial<ActiveCompanyContext>,
): ActiveCompanyContext {
  const activeCompanies =
    user?.companies?.filter(
      (link) => !link.status || link.status.toUpperCase() === 'ACTIVE',
    ) ?? [];

  const companyId =
    overrides?.companyId ??
    user?.companyId ??
    activeCompanies[0]?.companyId ??
    user?.companies?.[0]?.companyId;

  const activeLink =
    user?.companies?.find((link) => link.companyId === companyId) ??
    activeCompanies[0] ??
    user?.companies?.[0];

  return {
    companyId,
    permissions:
      overrides?.permissions ??
      user?.permissions ??
      activeLink?.permissions ??
      [],
    roles: overrides?.roles ?? user?.roles ?? activeLink?.roles ?? [],
  };
}
