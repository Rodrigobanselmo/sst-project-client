type RiskFormHydrationSource = Record<string, any>;

/**
 * Origem dos campos do formulário: `options.initialData` (página de edição) ou, no modal
 * legado, o payload de `ModalEnum.RISK_ADD`. Retornos de sub-modais (RecMed/Fonte) e
 * `passBack` não são dados do fator e não hidratam campos.
 */
export const resolveRiskFormHydrationSource = (
  optionsInitialData?: RiskFormHydrationSource | null,
  modalData?: RiskFormHydrationSource | null,
): RiskFormHydrationSource | undefined => {
  if (optionsInitialData) return optionsInitialData;
  if (!modalData || !Object.keys(modalData).length) return undefined;
  if (modalData.isAddRecMed || modalData.isAddGenerateSource || modalData.passBack) {
    return undefined;
  }
  return modalData;
};
