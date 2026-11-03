export type DispatchMailPolicy = {
  revision: number;
  enabled: boolean;
  notifyOperator: boolean;
  responsibleUserIds: number[];
};
export type DispatchMailRecipient = { id: number; name: string; email: string };
export type DispatchMailResult = {
  id: string;
  role: string;
  address: string;
  state: string;
  attempts: number;
  errorCode?: string;
  updatedAt: string;
  sentAt?: string;
};
export type DispatchMailNotice = {
  id: string;
  round: number;
  kind: string;
  state: string;
  errorCode?: string;
  createdAt: string;
  recipients: DispatchMailResult[];
};
export const dispatchMailStateLabel = (state: string): string =>
  ({
    PENDING: 'Aguardando envio',
    ROUTED: 'Destinatários definidos',
    CLAIMED: 'Preparando e-mail',
    SENDING: 'Enviando e-mail',
    RETRY: 'Nova tentativa agendada',
    SENT: 'Aceito pelo provedor de e-mail',
    FAILED: 'Envio não concluído',
    UNKNOWN: 'Resultado incerto — conferir provedor',
    SUPPRESSED: 'Aviso não enviado',
  })[state] || state;
export type MailResolution =
  | 'RETRY_FAILED'
  | 'CONFIRM_SENT'
  | 'RETRY_CONFIRMED_NOT_SENT';
export function dispatchMailReviewValid(
  mail: DispatchMailResult,
  action: MailResolution,
  reason: string,
  providerChecked: boolean,
) {
  return (
    reason.trim().length >= 10 &&
    reason.trim().length <= 500 &&
    (mail.state === 'FAILED'
      ? action === 'RETRY_FAILED'
      : mail.state === 'UNKNOWN' &&
        providerChecked &&
        ['CONFIRM_SENT', 'RETRY_CONFIRMED_NOT_SENT'].includes(action))
  );
}
export function dispatchMailRecipients(
  users: DispatchMailRecipient[],
  selected: DispatchMailRecipient[],
) {
  return [...new Map([...selected, ...users].map((u) => [u.id, u])).values()];
}
