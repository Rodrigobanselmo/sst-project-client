import { useState } from 'react';
import { parseCookies } from 'nookies';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
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
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorize = async () => {
    onStatusChange(actionId, 'executing');
    setIsExecuting(true);
    setError(null);

    try {
      const cookies = parseCookies();
      const token = cookies['nextauth.token'];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch(
        `${baseUrl}/ai-chat/actions/${actionId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao executar ação');
      }

      const resultData = await response.json();

      // Invalidate and refetch all RISK_DATA queries (force refetch even if staleTime hasn't expired)
      await queryClient.invalidateQueries([QueryEnum.RISK_DATA], {
        refetchType: 'all',
      });
      await queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION], {
        refetchType: 'all',
      });
      await queryClient.refetchQueries([QueryEnum.RISK_DATA], {
        type: 'active',
      });

      onStatusChange(actionId, 'completed');
    } catch (err: any) {
      const errorMsg = err.message || 'Erro ao executar ação';
      setError(errorMsg);
      onStatusChange(actionId, 'failed', errorMsg);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = async () => {
    try {
      const cookies = parseCookies();
      const token = cookies['nextauth.token'];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

      await fetch(`${baseUrl}/ai-chat/actions/${actionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      onStatusChange(actionId, 'cancelled');
    } catch {
      // Silent fail
      onStatusChange(actionId, 'cancelled');
    }
  };

  const renderIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'executing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '📋';
    }
  };

  const renderStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Aguardando autorização';
      case 'executing':
        return 'Executando...';
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelado';
      default:
        return '';
    }
  };

  return (
    <div className={`${styles.actionCard} ${styles[status]}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{renderIcon()}</span>
        <span className={styles.statusText}>{renderStatusText()}</span>
      </div>

      <div className={styles.summary}>{summary}</div>

      {details && Object.keys(details).length > 0 && (
        <div className={styles.details}>
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className={styles.detailItem}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {status === 'pending' && (
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.buttonAuthorize}`}
            onClick={handleAuthorize}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executando...' : 'Autorizar'}
          </button>
          <button
            className={`${styles.button} ${styles.buttonCancel}`}
            onClick={handleCancel}
            disabled={isExecuting}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
