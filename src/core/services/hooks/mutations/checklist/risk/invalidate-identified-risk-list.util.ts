import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';

/** Lista de Caracterização → Riscos e as demais RiskCompanyTable. */
export const IDENTIFIED_RISK_LIST_QUERY_KEY = [QueryEnum.RISK, 'company'] as const;

export function invalidateIdentifiedRiskList() {
  queryClient.invalidateQueries(IDENTIFIED_RISK_LIST_QUERY_KEY);
}
