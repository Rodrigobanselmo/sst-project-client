import { IErrorResp } from '@v2/types/error.type';
import { extractApiError } from '@v2/utils/extract-api-error';

import {
  RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE,
  RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE,
} from './risk-catalog-equivalence-scope.util';

function isSystemAsAliasApiMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('item de sistema deve ser usado como canônico') ||
    lower.includes('inverta a seleção')
  );
}

function isDifferentCompanyApiMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('empresas diferentes') ||
    lower.includes('merge entre empresas')
  );
}

export function formatRiskCatalogEquivalenceError(error: unknown): string {
  if (typeof error === 'string' && error.trim()) return error.trim();

  const apiMessage = extractApiError(error as IErrorResp);
  if (apiMessage) {
    if (isSystemAsAliasApiMessage(apiMessage)) {
      return RISK_CATALOG_SYSTEM_AS_ALIAS_MESSAGE;
    }
    if (isDifferentCompanyApiMessage(apiMessage)) {
      return RISK_CATALOG_DIFFERENT_COMPANY_MESSAGE;
    }
    return apiMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}
