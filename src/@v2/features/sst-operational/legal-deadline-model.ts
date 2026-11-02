/** Read-only projection from the server. The browser never calculates a legal deadline. */
export type EventDeadlinePresentation = {
  deadline: {
    family: 'S-2210' | 'S-2220' | 'S-2221' | 'S-2240' | 'S-3000';
    environment: 1 | 2;
    legalEffect: boolean;
    state:
      | 'CALCULATED'
      | 'IMMEDIATE'
      | 'NO_FIXED_DEADLINE'
      | 'NEEDS_REVIEW'
      | 'NOT_APPLICABLE';
    urgency: 'NORMAL' | 'IMMEDIATE' | 'ACTION_REQUIRED';
    precision: 'CIVIL_DATE' | 'IMMEDIATE' | 'NONE';
    dueDate: string | null;
    basisDate: string | null;
    originalDueDate: string | null;
    nominalDueDate?: string | null;
    calendar: {
      id: string;
      version: string;
      kind: 'FISCAL' | 'CAT_LOCAL';
      scope: string;
      sha256: string;
    } | null;
    diagnostics: { code: string; message: string; field?: string }[];
    authority?: { reviewedOn: string; sourceUrl: string };
    authorityPages?: readonly number[];
    ruleSetVersion?: string;
    ruleId?: string;
    actionRequired?: boolean;
  };
  assessment: string;
  asOf: string;
  timezone: 'America/Sao_Paulo';
  pending: boolean;
  accepted: boolean;
  excluded: boolean;
  deliveryState: string | null;
  policyVersion: string | null;
  policySha256: string | null;
  contextPin: { sourceId: string; snapshotHash: string } | null;
};

function civilDisplay(value?: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 1900 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > days[month - 1]
  )
    return null;
  return `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;
}

export function legalDeadlineSummary(
  presentation?: EventDeadlinePresentation | null,
) {
  if (!presentation?.deadline) return null;
  const d = presentation.deadline;
  const simulation = d.environment === 2 || !d.legalEffect;
  const dueDate =
    d.state === 'CALCULATED' && d.precision === 'CIVIL_DATE'
      ? civilDisplay(d.dueDate)
      : null;
  const immediate = d.urgency === 'IMMEDIATE' || d.state === 'IMMEDIATE';
  const accepted =
    presentation.accepted ||
    presentation.assessment === 'ACCEPTED_TIMELINESS_NOT_EVALUATED';
  const excluded =
    presentation.excluded ||
    presentation.assessment === 'EXCLUDED_REVIEW_REQUIRED';
  let title = 'Conferência necessária';
  let message =
    'O prazo depende da conferência do contexto e das regras aplicáveis. Nenhuma data de vencimento foi presumida.';
  let severity: 'info' | 'warning' | 'error' = 'warning';
  if (d.state === 'NOT_APPLICABLE') {
    title = 'Prazo não aplicável ao contexto conferido';
    message = 'Confira os detalhes da aplicabilidade deste evento.';
    severity = 'info';
  } else if (d.state === 'NO_FIXED_DEADLINE') {
    title = 'Ação necessária, sem prazo próprio fixo';
    message =
      d.family === 'S-3000'
        ? 'A exclusão deve ser tratada quando necessária. Ela não renova nem substitui o prazo da obrigação do evento excluído.'
        : 'A retificação deve corrigir a informação incorreta. Ela não abre um novo prazo; confira o prazo do evento original.';
  } else if (dueDate) {
    title = 'Prazo calculado para este evento';
    message =
      'A data considera o contexto e o calendário conferidos pelo sistema.';
    severity = 'info';
    if (!simulation && presentation.assessment === 'OVERDUE') {
      title = 'Prazo calculado já ultrapassado';
      severity = 'error';
    } else if (!simulation && presentation.assessment === 'DUE_TODAY') {
      title = 'Prazo calculado para hoje';
      severity = 'warning';
    }
  }
  if (immediate) {
    title = 'CAT: ação imediata';
    message =
      d.state === 'NEEDS_REVIEW'
        ? 'A comunicação de óbito exige ação imediata. A conferência pendente não elimina essa urgência; confira os detalhes.'
        : 'A comunicação de óbito exige ação imediata, sem tolerância automática até o fim do dia.';
    severity = simulation ? 'warning' : 'error';
  }
  if (presentation.assessment === 'TRANSMISSION_TIMELINESS_UNKNOWN') {
    if (immediate) {
      message +=
        ' O resultado da transmissão ainda está em conferência; o cumprimento do prazo não foi determinado.';
    } else {
      title = 'Envio em conferência: cumprimento do prazo não avaliado';
      message =
        'O processamento ou o resultado da transmissão ainda precisa ser confirmado. A data calculada, quando disponível, é informativa e não comprova atraso nem cumprimento do prazo.';
      if (d.state === 'NEEDS_REVIEW')
        message +=
          ' O contexto necessário ao cálculo também precisa de conferência.';
      severity = 'info';
    }
  }
  if (accepted) {
    title = 'Evento aceito: cumprimento do prazo não avaliado';
    message =
      'A aceitação pelo eSocial não comprova que o prazo legal foi cumprido.';
    severity = 'info';
  }
  if (excluded) {
    title = 'Evento excluído: confira a obrigação original';
    message =
      'A exclusão preserva o histórico e não renova o prazo da obrigação original.';
    severity = 'warning';
  } else if (presentation.assessment === 'CANCELLED') {
    title = 'Preparação cancelada';
    message =
      'O cancelamento desta preparação não comprova o cumprimento da obrigação.';
    severity = 'info';
  }
  const details: { label: string; value: string }[] = [];
  const addDate = (label: string, value?: string | null) => {
    const date = civilDisplay(value);
    if (date) details.push({ label, value: date });
  };
  addDate('Data-base considerada', d.basisDate);
  addDate('Prazo original registrado', d.originalDueDate);
  addDate('Conferido em', presentation.asOf);
  if (d.calendar)
    details.push({
      label: 'Calendário conferido',
      value: `${d.calendar.kind === 'FISCAL' ? 'Fiscal' : 'CAT local'} · ${d.calendar.scope} · versão ${d.calendar.version}`,
    });
  if (presentation.contextPin)
    details.push({
      label: 'Contexto',
      value: 'Vinculado ao conteúdo preservado deste evento',
    });
  if (presentation.policyVersion)
    details.push({
      label: 'Configuração conferida',
      value: presentation.policyVersion,
    });
  addDate('Referência normativa revisada em', d.authority?.reviewedOn);
  if (d.authorityPages?.length)
    details.push({
      label: 'Páginas do manual',
      value: d.authorityPages.join(', '),
    });
  const authorityUrl = d.authority?.sourceUrl;
  return {
    title,
    message,
    severity,
    simulation,
    immediate,
    dueLabel: dueDate
      ? `${simulation ? 'Vencimento simulado' : 'Vencimento calculado'}: ${dueDate}`
      : null,
    immediateNote:
      immediate && (accepted || excluded)
        ? 'A regra da CAT neste contexto exige ação imediata.'
        : null,
    details,
    diagnostics:
      d.diagnostics?.map((item) => item.message).filter(Boolean) || [],
    authorityUrl:
      authorityUrl && /^https:\/\/www\.gov\.br\/esocial\//.test(authorityUrl)
        ? authorityUrl
        : null,
  };
}
