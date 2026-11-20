import React, { createContext, FC, ReactNode, useContext } from 'react';

import { IRiskData } from 'core/interfaces/api/IRiskData';

/**
 * Registro (RiskFactorData) dono das colunas na visualização por risco.
 * Fora dela não há escopo, e o arrastar continua copiando só entre fatores.
 */
export type RiskCatalogRecordScopeValue = {
  riskData: IRiskData;
  /** Stable row identity, including an entity with no persisted evaluation yet. Never sent to the API. */
  copyIdentity?: string;
  /** Nome do GSE, usado nas mensagens de cópia. */
  label: string;
};

const RiskCatalogRecordScopeContext =
  createContext<RiskCatalogRecordScopeValue | null>(null);

export const RiskCatalogRecordScope: FC<{
  value: RiskCatalogRecordScopeValue;
  children: ReactNode;
}> = ({ value, children }) => (
  <RiskCatalogRecordScopeContext.Provider value={value}>
    {children}
  </RiskCatalogRecordScopeContext.Provider>
);

export const useRiskCatalogRecordScope = () =>
  useContext(RiskCatalogRecordScopeContext);
