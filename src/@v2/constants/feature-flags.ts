// Liga por padrão; só desativa se a env vier explicitamente como 'false'.
// Usado por kill-switches de telas administrativas que já são protegidas por role.
const isFlagEnabledByDefault = (value?: string): boolean => value !== 'false';

export const featureFlags = {
  // Biblioteca SimpleSST de regras Exame × Risco. Tela administrativa MASTER:
  // ativa por padrão (visível para MASTER) e desligável via env=false como
  // kill-switch visual. A segurança real continua nos guards MASTER (menu,
  // withSSRAuth, SAuthShow e @Roles na API), não nesta flag.
  examRiskRuleLibrary: isFlagEnabledByDefault(
    process.env.NEXT_PUBLIC_FEATURE_EXAM_RISK_RULE_LIBRARY,
  ),
  // Curadoria SimpleSST de procedimentos da Tabela 27 do eSocial. Tela MASTER:
  // ativa por padrão (visível para MASTER) e desligável via env=false como
  // kill-switch visual. A Tabela 27 oficial permanece somente leitura; a
  // segurança real continua nos guards MASTER (menu, withSSRAuth, SAuthShow e
  // @Roles na API), não nesta flag.
  esocialProcedureCuration: isFlagEnabledByDefault(
    process.env.NEXT_PUBLIC_FEATURE_ESOCIAL_PROCEDURE_CURATION,
  ),
} as const;
