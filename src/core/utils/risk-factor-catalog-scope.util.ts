export const GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE =
  'Este fator de risco pertence ao catálogo padrão SimpleSST. Usuários não master não podem alterar este cadastro global.';

export const FUTURE_COMPANY_RISK_COPY_HINT =
  'Em uma próxima versão, será possível criar uma cópia deste fator de risco para personalização na sua empresa.';

export type RiskFactorCatalogScopeSource = {
  id?: string;
  system?: boolean;
  representAll?: boolean;
  companyId?: string;
};

export const isGlobalCatalogRiskFactor = (
  risk?: RiskFactorCatalogScopeSource,
): boolean => Boolean(risk?.system) || Boolean(risk?.representAll);

export const canUserEditCatalogRiskFactor = (params: {
  risk?: RiskFactorCatalogScopeSource;
  isMaster?: boolean;
  userCompanyId?: string;
}): boolean => {
  if (!isGlobalCatalogRiskFactor(params.risk)) return true;

  return Boolean(
    params.isMaster &&
      params.userCompanyId &&
      params.risk?.companyId &&
      params.userCompanyId === params.risk.companyId,
  );
};

export const isRiskFactorCatalogReadOnly = (params: {
  risk?: RiskFactorCatalogScopeSource;
  isMaster?: boolean;
  userCompanyId?: string;
}): boolean => {
  if (!params.risk?.id) return false;
  if (!isGlobalCatalogRiskFactor(params.risk)) return false;

  return !canUserEditCatalogRiskFactor(params);
};

/**
 * Futuro: fluxo "Criar cópia para minha empresa" deve gerar registro com
 * `system: false`, `companyId` do tenant e campos copiados do catálogo global.
 */
