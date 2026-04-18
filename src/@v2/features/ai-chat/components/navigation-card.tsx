import { useRouter } from 'next/router';
import type { NavigationData } from '../hooks/use-ai-chat-stream';
import styles from './navigation-card.module.css';

interface NavigationCardProps {
  data: NavigationData;
}

function resolveRoute(target: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
    target,
  );
}

export function NavigationCard({ data }: NavigationCardProps) {
  const router = useRouter();

  const handleOpen = () => {
    const resolved = resolveRoute(data.target, data.params);
    router.push(resolved);
  };

  return (
    <div className={styles.navigationCard}>
      <div className={styles.header}>
        <span className={styles.icon}>{data.icon ?? '🔗'}</span>
        <span className={styles.kindLabel}>Ir para página</span>
      </div>

      <div className={styles.label}>{data.label}</div>

      {data.description && (
        <div className={styles.description}>{data.description}</div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={handleOpen}>
          Abrir
        </button>
      </div>
    </div>
  );
}
