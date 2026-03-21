import { useAIChat } from '../context/ai-chat-context';
import styles from './ai-chat-toggle-button.module.css';
import AiIcon from '../../../../../public/icons/brand/ai.svg';

export function AIChatToggleButton() {
  const { toggle, isOpen } = useAIChat();

  return (
    <button
      className={`${styles.button} ${isOpen ? styles.buttonActive : ''}`}
      onClick={toggle}
      title="AI Assistant"
      aria-label="Toggle AI Assistant"
    >
      <AiIcon width={28} height={28} />
    </button>
  );
}
