export type PortfolioCompany = {
  id: string;
  name: string;
  fantasy: string | null;
  cnpj: string | null;
  fromDate: string | null;
  employees: number;
  unpreparedEmployees: number;
  pendingComposition: number;
  sourceReviews: number;
  capturePending: boolean;
  preparedEvents: number;
  blockedPreparations: number;
  activeRuns: number;
  deliveries: Record<string, number>;
  latestRun: {
    id: string;
    state: string;
    total: number;
    createdAt: string;
  } | null;
};
export type PortfolioEvent = {
  id: string;
  store: 'INITIAL' | 'SECONDARY';
  companyId: string;
  companyName: string;
  family: string;
  state: string;
  preparationId: string;
  effectiveFrom: string | null;
  employeeName: string;
  matricula: string;
  operation: string;
  createdAt: string;
  errorCode: string | null;
  receipt: string | null;
  agentCodes: string[] | null;
  agentLabels?: string[] | null;
};
export type PortfolioPage = {
  companies?: PortfolioCompany[];
  events?: PortfolioEvent[];
  environment: 1 | 2;
  nextCursor: string | null;
};
export const portfolioStates = [
  'READY',
  'QUEUED',
  'SENDING',
  'PROCESSING',
  'POLLING',
  'ACCEPTED',
  'REJECTED',
  'BLOCKED',
  'UNKNOWN',
  'RECOVERING',
  'CANCELLED',
  'REVIEW_REQUIRED',
  'NO_CHANGES',
];
export function portfolioStateLabel(state: string) {
  return (
    (
      {
        READY: 'Preparado · não enviado',
        QUEUED: 'Aguardando envio',
        SENDING: 'Transmitindo',
        PROCESSING: 'Processando no eSocial',
        POLLING: 'Consultando resultado',
        ACCEPTED: 'Aceito',
        REJECTED: 'Recusado',
        BLOCKED: 'Impedido',
        UNKNOWN: 'Resultado incerto',
        RECOVERING: 'Conferindo resultado',
        CANCELLED: 'Cancelado',
        REVIEW_REQUIRED: 'Revisão necessária',
        NO_CHANGES: 'Sem alterações',
      } as Record<string, string>
    )[state] || `Situação: ${state}`
  );
}
export function portfolioTotals(company: PortfolioCompany) {
  const n = (key: string) => company.deliveries[key] || 0;
  return {
    accepted: n('ACCEPTED'),
    processing: n('QUEUED') + n('SENDING') + n('PROCESSING') + n('POLLING'),
    uncertain: n('UNKNOWN') + n('RECOVERING'),
    failures: n('REJECTED') + n('BLOCKED'),
  };
}
export function portfolioQueryKey(
  filters: {
    environment: number;
    search: string;
    filter?: string;
    family?: string;
    state?: string;
  },
  cursor?: string,
) {
  const query = new URLSearchParams({
    environment: String(filters.environment),
  });
  for (const [key, value] of Object.entries(filters))
    if (key !== 'environment' && value) query.set(key, String(value));
  if (cursor) query.set('cursor', cursor);
  return query.toString();
}
export function portfolioEventSummary(event: PortfolioEvent) {
  if (event.family === 'S-2240') {
    const codes = event.agentCodes || [];
    if (codes.length === 1 && codes[0] === '09.01.001')
      return 'Ausência de agentes nocivos declarados';
    return codes.length
      ? `Agentes da Tabela 24: ${(event.agentLabels?.length ? event.agentLabels : codes).join(', ')}`
      : 'Condições ambientais do vínculo';
  }
  return (
    (
      {
        'S-2210': 'Comunicação de acidente de trabalho',
        'S-2220': 'Monitoramento da saúde ocupacional',
        'S-2221': 'Exame toxicológico',
        'S-3000': 'Exclusão de evento',
      } as Record<string, string>
    )[event.family] || event.family
  );
}
