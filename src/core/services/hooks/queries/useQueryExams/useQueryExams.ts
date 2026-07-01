import { useQuery } from 'react-query';

import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ExamOriginEnum, IExam } from 'core/interfaces/api/IExam';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryExam {
  name?: string;
  search?: string | null;
  companyId?: string;
  clinicId?: string;
  status?: StatusEnum;
  isAvaliation?: boolean;
  isAttendance?: boolean;
  origin?: ExamOriginEnum;
  orderBy?: 'name' | 'analyses' | 'material' | 'status' | 'created_at';
  orderByDirection?: 'asc' | 'desc';
  // Contexto de aplicabilidade por categoria do risco (Fase 1). Opcional e
  // retrocompatível: sem riskType a lista é idêntica à atual. Com riskType, a
  // API esconde exames incompatíveis (hoje, NR-07 para riscos não químicos),
  // a menos que includeIncompatible seja true ("Mostrar todos os exames").
  riskType?: RiskEnum;
  includeIncompatible?: boolean;
  // Contexto de aplicabilidade por agente (Fase 2B). Opcional e retrocompatível:
  // quando enviados com includeIncompatible=false, a API restringe a lista aos
  // exames recomendados para o agente (regras ACTIVE/AGENT da Biblioteca +
  // vínculos de indicadores biológicos). Sem esses params, comportamento atual.
  agentCas?: string;
  agentName?: string;
  // Caminho consolidado ACGIH/BEI: id do fator de risco da empresa em contexto.
  // Quando enviado com includeIncompatible=false, a API inclui nos recomendados
  // os exames alcançados por BiologicalIndicatorToRisk → BiologicalIndicatorToExam.
  // Resolve grupos/isômeros (ex.: "Heptano, todos os isômeros" vs "n-Heptano"),
  // onde o casamento por CAS/nome falha. Sem esse param, comportamento atual.
  riskFactorId?: string;
}

/** Metadado retornado pela API quando o filtro por agente é aplicado (Fase 2B). */
export interface IExamAgentFilter {
  applied: true;
  recommendedCount: number;
}

export const queryExams = async (
  { skip, take }: IPagination,
  query: IQueryExam,
) => {
  if ('search' in query && query.search === null)
    return { data: [], count: 0, agentFilter: undefined };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IExam[]>>(
    `${ApiRoutesEnum.EXAM}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryExams(
  page = 1,
  query = {} as IQueryExam,
  take = 20,
  keepPreviousData = true,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.EXAMS, page, { ...pagination, ...query, companyId }],
    () => queryExams(pagination, { ...query, companyId }),
    {
      staleTime: 30_000,
      keepPreviousData,
    },
  );

  const response = {
    data: data?.data || ([] as IExam[]),
    count: data?.count || 0,
  };

  return {
    ...result,
    data: response.data,
    count: response.count,
    agentFilter: data?.agentFilter,
  };
}
