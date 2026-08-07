export const GLOBAL_CATALOG_RISK_READ_ONLY_MESSAGE =
  'Este fator de risco pertence ao catálogo padrão SimpleSST. Usuários não master não podem alterar este cadastro global.';

export const COMPANY_RISK_COPY_HINT =
  'Cria um novo fator local na sua empresa com os dados cadastrais deste item. Caracterizações, exames, protocolos e demais vínculos não são copiados.';

/** @deprecated Use COMPANY_RISK_COPY_HINT */
export const FUTURE_COMPANY_RISK_COPY_HINT = COMPANY_RISK_COPY_HINT;

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
 * Cópia local explícita (banner “Criar cópia para minha empresa”):
 * `buildRiskFactorLocalCompanyCopyDraft` + `asLocalCompanyCopy` no POST /risk.
 * Duplicar usa criação normal (sem forçar escopo local).
 */
