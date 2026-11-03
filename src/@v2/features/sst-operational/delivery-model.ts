import type { EventDeadlinePresentation } from './legal-deadline-model';

export type SendingEnvironment = 1 | 2;
export type PreparationMode = 'INITIAL' | 'CHANGES';
export type PreparationSelection = 'CURRENT' | 'HISTORY';
export type DeclarationDiagnostic = {
  code: string;
  employeeId?: number;
  employmentId?: string;
  effectiveFrom?: string;
};
export type DeclarationDelivery = {
  state: string;
  receipt?: string | null;
  protocol?: string | null;
  errorCode?: string | null;
  excluded?: boolean;
  exclusionPending?: boolean;
};
export type DeclarationEvent = {
  id: string;
  employmentId: string;
  employeeName?: string;
  matricula?: string | null;
  content?: { ideVinculo?: { matricula?: string } };
  effectiveFrom: string;
  effectiveTo?: string | null;
  operation?: 'ORIGINAL' | 'RECTIFICATION';
  rectifiedReceipt?: string | null;
  unsignedXml?: string;
  diagnostics?: DeclarationDiagnostic[];
  delivery?: DeclarationDelivery | null;
  legalDeadline?: EventDeadlinePresentation;
};
export type DeclarationRun = {
  id: string;
  state: string;
  environment: SendingEnvironment;
  createdAt?: string;
  sourceHash?: string;
  policyRevision?: number;
  fromDate?: string;
  policyStale?: boolean;
  sourceManifest?: {
    mode?: PreparationMode;
    selection?: PreparationSelection;
    employerRegistration?: string;
  };
  diagnostics?: DeclarationDiagnostic[];
  events: DeclarationEvent[];
};
export type DeclarationOverview = {
  employerRegistration: string;
  employerRegistrationOptions?: string[];
  environments: { restricted: boolean; production: boolean };
  employees: { id: number; name: string; esocialCode?: string | null }[];
  totalEmployeeCount: number;
  matchedEmployeeCount?: number;
  listTruncated?: boolean;
  currentPolicyRevision?: number | null;
  runs: DeclarationRun[];
};

export function declarationStatusLabel(run: DeclarationRun) {
  const deliveries = run.events.flatMap((event) =>
    event.delivery ? [event.delivery] : [],
  );
  if (deliveries.some((delivery) => delivery.exclusionPending))
    return 'Há exclusões aguardando confirmação pelo eSocial';
  if (deliveries.length && deliveries.every((delivery) => delivery.excluded))
    return 'Eventos excluídos pelo eSocial — histórico preservado';
  if (deliveries.some((delivery) => delivery.excluded))
    return 'Há eventos excluídos — confira o resultado de cada vínculo';
  if (
    deliveries.length &&
    deliveries.length === run.events.length &&
    deliveries.every((d) => d.state === 'ACCEPTED')
  )
    return 'Todos os eventos aceitos pelo eSocial';
  if (deliveries.some((d) => d.state === 'REJECTED'))
    return 'Há eventos rejeitados — confira o resultado de cada vínculo';
  if (
    deliveries.some((d) =>
      ['UNKNOWN', 'UNCERTAIN', 'RECOVERING'].includes(d.state),
    )
  )
    return 'Há resultados em reconciliação';
  if (deliveries.length)
    return 'Envio confirmado — acompanhe o resultado de cada evento';
  if (run.policyStale) return 'Prepare novamente com a data inicial atual';
  return deliveryStateLabel(run.state);
}

export function declarationDeliveryLabel(delivery: DeclarationDelivery) {
  if (delivery.exclusionPending) return 'Exclusão em confirmação';
  if (delivery.state === 'ACCEPTED' && delivery.excluded)
    return 'Aceito — excluído pelo eSocial';
  return deliveryStateLabel(delivery.state);
}

export function deliveryStateLabel(state: string) {
  const labels: Record<string, string> = {
    READY: 'Pronto para conferir',
    BLOCKED: 'Impedido — confira a origem',
    QUEUED: 'Na fila de transmissão',
    SENDING: 'Transmitindo',
    POLLING: 'Aguardando processamento',
    SUBMITTED: 'Lote recebido; aguardando processamento',
    PROCESSING: 'Aguardando processamento',
    RECOVERING: 'Conferindo resultado do envio',
    RETRY: 'Nova tentativa programada',
    UNCERTAIN: 'Resultado incerto — em reconciliação',
    UNKNOWN: 'Resultado incerto — em reconciliação',
    ACCEPTED: 'Aceito pelo eSocial',
    REJECTED: 'Rejeitado pelo eSocial',
    CANCELLED: 'Cancelado',
  };
  return labels[state] || `Situação: ${state}`;
}

export function declarationOperationLabel(event: DeclarationEvent) {
  return event.operation === 'RECTIFICATION'
    ? 'Retificação do período'
    : 'Condição de trabalho';
}

export function deliveryErrorMessage(code: string) {
  if (code === 'PRE_SEND_BLOCKED')
    return 'O envio foi impedido antes da transmissão. Confira os cadastros e o certificado antes de retomar.';
  if (/^(EVENT_|LOT_)\d+$/.test(code))
    return `Retorno do eSocial: ${code.replace('EVENT_', 'evento ').replace('LOT_', 'lote ')}. Confira o resultado antes de preparar outro envio.`;
  if (/^(SEND_|POLL_|RECOVERY_)/.test(code))
    return `O processamento exige acompanhamento (${code}). Aguarde a conferência do resultado antes de reenviar.`;
  return `O processamento exige conferência. Código: ${code}.`;
}

export function isNoChange(run: DeclarationRun) {
  return (
    !run.policyStale &&
    run.state === 'READY' &&
    !run.events.length &&
    !run.diagnostics?.length
  );
}

export function canConfirmRun(run: DeclarationRun, enabled: boolean) {
  return (
    enabled &&
    !run.policyStale &&
    run.state === 'READY' &&
    !!run.sourceHash &&
    !run.diagnostics?.length &&
    run.events.length > 0 &&
    run.events.every((event) => !event.delivery && !event.diagnostics?.length)
  );
}

// Cancel/retry follow the same conservative boundary as the API: an uncertain
// submission must be reconciled, never sent a second time from the browser.
export function canCancelRun(run: DeclarationRun) {
  const deliveries = run.events.flatMap((e) =>
    e.delivery ? [e.delivery] : [],
  );
  return (
    deliveries.some((d) => d.state !== 'CANCELLED') &&
    deliveries.every(
      (d) =>
        ['QUEUED', 'BLOCKED', 'REJECTED', 'CANCELLED'].includes(d.state) &&
        (!d.protocol || d.state === 'REJECTED'),
    )
  );
}

export function canRetryRun(run: DeclarationRun, enabled: boolean) {
  return (
    enabled &&
    !run.policyStale &&
    run.events.some(
      ({ delivery: d }) =>
        d?.state === 'BLOCKED' &&
        !d.protocol &&
        d.errorCode === 'PRE_SEND_BLOCKED',
    )
  );
}

export function hasAcceptedDeclaration(runs: DeclarationRun[]) {
  return runs.some((run) =>
    run.events.some(
      (event) =>
        event.delivery?.state === 'ACCEPTED' && !event.delivery.excluded,
    ),
  );
}
