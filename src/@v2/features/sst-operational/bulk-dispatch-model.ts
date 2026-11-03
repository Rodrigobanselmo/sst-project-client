export type BulkDispatchCounts = {
  total: number;
  settled: number;
  pending: number;
  preparing: number;
  queued: number;
  processing: number;
  accepted: number;
  rejected: number;
  blocked: number;
  noChanges: number;
  cancelled: number;
  unknown: number;
};

export type BulkDispatchRun = {
  id: string;
  state: string;
  environment: 1 | 2;
  employerRegistration: string;
  counts: BulkDispatchCounts;
  eventCounts?: Record<string, number>;
  createdAt: string;
  snapshotOn?: string;
  updatedAt?: string;
  canCancel?: boolean;
  canResume?: boolean;
};

export type BulkDispatchItem = {
  id: string;
  employeeId: number;
  employeeName?: string;
  matricula?: string;
  state: string;
  initialRunId?: string;
  eventCount?: number;
  acceptedEvents?: number;
  message?: string;
  diagnostics?: { code?: string; message?: string }[];
  receipt?: string | null;
  receipts?: string[];
};

export type BulkDispatchRunPage = {
  runs: BulkDispatchRun[];
  nextCursor?: string | null;
};
export type BulkDispatchItemPage = {
  items: BulkDispatchItem[];
  nextCursor?: string | null;
};

export const BULK_DISPATCH_FILTERS = [
  ['', 'Todas as situações'],
  ['BLOCKED', 'Informações para corrigir'],
  ['PENDING', 'Aguardando conferência'],
  ['PREPARING', 'Conferindo os cadastros'],
  ['NO_CHANGES', 'Sem alterações para enviar'],
  ['QUEUED', 'Aguardando transmissão'],
  ['PROCESSING', 'Aguardando resultado'],
  ['UNKNOWN', 'Resultado em conferência'],
  ['ACCEPTED', 'Aceitos pelo eSocial'],
  ['REJECTED', 'Rejeitados pelo eSocial'],
  ['CANCELLED', 'Pendências canceladas'],
] as const;

export function bulkDispatchStateLabel(state: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Aguardando conferência',
    PREPARING: 'Conferindo os cadastros',
    PREPARED: 'Conferência concluída',
    QUEUED: 'Aguardando transmissão',
    PROCESSING: 'Aguardando resultado',
    FOLLOWING_UP: 'Acompanhando nova tentativa individual',
    SENDING: 'Transmitindo',
    POLLING: 'Consultando resultado',
    UNKNOWN: 'Resultado em conferência',
    RECOVERING: 'Recuperando resultado',
    ACCEPTED: 'Aceito pelo eSocial',
    REJECTED: 'Rejeitado pelo eSocial',
    BLOCKED: 'Corrija as informações na origem',
    NO_CHANGES: 'Sem alterações para enviar',
    CANCELLED: 'Pendência cancelada',
    REQUESTED: 'Solicitação recebida',
    RUNNING: 'Execução em andamento',
    SCANNING: 'Identificando os empregados',
    DISCOVERING: 'Identificando os empregados',
    WAITING: 'Aguardando resultados dos envios',
    COMPLETED: 'Execução concluída',
    COMPLETED_WITH_ERRORS: 'Concluída com itens para conferir',
    COMPLETED_WITH_ISSUES: 'Concluída com itens para conferir',
    CANCELLING: 'Cancelando somente pendências',
    PAUSED: 'Execução pausada',
  };
  return labels[state] || 'Em acompanhamento';
}

export function bulkDispatchRunLabel(run: BulkDispatchRun): string {
  const date = new Date(run.createdAt);
  const when = Number.isNaN(date.getTime())
    ? 'Data não disponível'
    : date.toLocaleString('pt-BR');
  return `${when} · ${run.environment === 2 ? 'Testes' : 'Produção'} · ${bulkDispatchStateLabel(run.state)}`;
}

/** Stable payload identity: a lost response must retry the same durable request. */
export function bulkDispatchRequestKey(input: {
  companyId: string;
  environment: 1 | 2;
  employerRegistration: string;
}): string {
  return JSON.stringify([
    input.companyId,
    input.environment,
    input.employerRegistration,
    'CURRENT',
    'SEND_PENDING',
  ]);
}

/** Server counts are mutually exclusive per employee; unknown is not settled. */
export function bulkDispatchProgress(counts: BulkDispatchCounts): number {
  if (!Number.isFinite(counts.total) || counts.total <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, Math.round((counts.settled / counts.total) * 100)),
  );
}

/** Polling can update previous pages; a stable item identity must not duplicate rows. */
export function bulkDispatchItems(
  pages: BulkDispatchItemPage[],
): BulkDispatchItem[] {
  const result = new Map<string, BulkDispatchItem>();
  for (const page of pages)
    for (const item of page.items) result.set(item.id, item);
  return [...result.values()];
}

export function bulkDispatchItemMessage(item: BulkDispatchItem): string {
  if (item.message) return item.message;
  const messages = (item.diagnostics || [])
    .map((diagnostic) => diagnostic.message)
    .filter(Boolean);
  if (messages.length) return messages.join(' ');
  if (item.state === 'BLOCKED')
    return 'Confira os dados deste empregado e suas condições no cadastro de origem.';
  if (item.state === 'NO_CHANGES')
    return 'O conteúdo já aceito continua igual. Nenhum evento adicional foi criado.';
  return '';
}
