import { v2QueryClient } from '@v2/services/query-client';
import { useState } from 'react';
import { api } from 'core/services/apiClient';
import { messageOf } from '@v2/features/sst-operational/api';
import styles from './action-card.module.css';
interface ActionCardProps {
  actionId: string;
  summary: string;
  details: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  onStatusChange: (
    actionId: string,
    status: 'executing' | 'completed' | 'failed' | 'cancelled',
    error?: string,
  ) => void;
}
export function ActionCard({
  actionId,
  summary,
  details,
  status,
  onStatusChange,
}: ActionCardProps) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const openReview = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/ai-chat/actions/${actionId}/confirm`);

      v2QueryClient.invalidateQueries({ queryKey: ['ai-threads'] });
      if (['COMPLETED', 'CANCELLED'].includes(data.status))
        onStatusChange(
          actionId,
          data.status === 'COMPLETED' ? 'completed' : 'cancelled',
        );
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/ai-chat/actions/${actionId}/cancel`);
      onStatusChange(
        actionId,
        data.status === 'COMPLETED' ? 'completed' : 'cancelled',
      );
      v2QueryClient.invalidateQueries({ queryKey: ['ai-threads'] });
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const editable = ['pending', 'failed', 'executing'].includes(status);
  return (
    <>
      <div className={`${styles.actionCard} ${styles[status]}`}>
        <div className={styles.header}>
          <span className={styles.statusText}>
            {status === 'completed'
              ? 'Aplicado à caracterização'
              : status === 'cancelled'
                ? 'Proposta rejeitada'
                : 'Proposta aguardando revisão humana'}
          </span>
        </div>
        <div className={styles.summary}>{summary}</div>
        {details && (
          <div className={styles.details}>
            {Object.entries(details)
              .filter(
                ([key]) =>
                  !['situação', 'situacao', 'status'].includes(
                    key.toLowerCase(),
                  ),
              )
              .map(([k, v]) => (
                <div key={k} className={styles.detailItem}>
                  <strong>{k}:</strong> {String(v)}
                </div>
              ))}
          </div>
        )}
        <div className={styles.detailItem}>
          Confirme a alteração no cadastro. Quando necessário, informe o período
          aqui na conversa. Isso não transmite ao eSocial.
        </div>
        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}
        {editable && (
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.buttonAuthorize}`}
              disabled={busy}
              onClick={openReview}
            >
              {busy ? 'Carregando…' : 'Confirmar alteração no cadastro'}
            </button>
            <button
              className={`${styles.button} ${styles.buttonCancel}`}
              disabled={busy}
              onClick={cancel}
            >
              Rejeitar proposta
            </button>
          </div>
        )}
      </div>
    </>
  );
}
