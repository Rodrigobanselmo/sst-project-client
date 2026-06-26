const isFlagEnabled = (value?: string): boolean =>
  value === 'true' || value === '1';

export const featureFlags = {
  // Biblioteca SimpleSST de regras Exame × Risco (MASTER). Mantida oculta por
  // padrão para não expor a UI ao cliente final antes da homologação do épico.
  examRiskRuleLibrary: isFlagEnabled(
    process.env.NEXT_PUBLIC_FEATURE_EXAM_RISK_RULE_LIBRARY,
  ),
} as const;
