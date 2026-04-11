import { useAIChat } from '../context/ai-chat-context';
import styles from './ai-chat-toggle-button.module.css';
import Image from 'next/image';

export function AIChatToggleButton() {
  const { toggle, isOpen } = useAIChat();

  return (
    <button
      className={`${styles.button} ${isOpen ? styles.buttonActive : ''}`}
      onClick={toggle}
      title="AI Assistant"
      aria-label="Toggle AI Assistant"
    >
      <Image
        src="/icons/brand/ai.svg"
        alt="AI Assistant"
        width={28}
        height={28}
      />
    </button>
  );
}
