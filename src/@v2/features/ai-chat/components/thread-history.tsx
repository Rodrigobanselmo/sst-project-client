import { useState, useRef, useCallback, useEffect } from 'react';
import ArrowBack from '@mui/icons-material/ArrowBack';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {
  useQueryAIThreads,
  useDeleteAIThreadMutation,
  type AIThread,
} from '../api/ai-thread.hooks';
import { formatRelativeTime, getDateLabel } from '../utils/format-time';
import styles from './thread-history.module.css';

interface ThreadHistoryProps {
  onClose: () => void;
  onSelectThread: (threadId: string) => void;
  currentThreadId: string | null;
}

interface GroupedThreads {
  label: string;
  threads: AIThread[];
}

function groupThreadsByDate(threads: AIThread[]): GroupedThreads[] {
  const groups = new Map<string, AIThread[]>();

  threads.forEach((thread) => {
    const date = new Date(thread.updatedAt);
    const label = getDateLabel(date);

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(thread);
  });

  return Array.from(groups.entries()).map(([label, threads]) => ({
    label,
    threads,
  }));
}

export function ThreadHistory({
  onClose,
  onSelectThread,
  currentThreadId,
}: ThreadHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useQueryAIThreads({
      first: 20,
      search: debouncedSearch || null,
    });

  const deleteThreadMutation = useDeleteAIThreadMutation();

  // Flatten all pages into a single list
  const threads =
    data?.pages.flatMap((page) => page.edges.map((e) => e.node)) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const handleDelete = (
    threadId: string,
    threadTitle: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${threadTitle}"? Esta ação não pode ser desfeita.`,
    );
    if (confirmed) {
      deleteThreadMutation.mutate(threadId);
    }
  };

  const handleSelectThread = (threadId: string) => {
    onSelectThread(threadId);
    onClose();
  };

  const groupedThreads = groupThreadsByDate(threads);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onClose}>
            <ArrowBack style={{ fontSize: 20 }} />
          </button>
          <h2 className={styles.title}>Chats</h2>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <SearchOutlined
            style={{ fontSize: 18 }}
            className={styles.searchIcon}
          />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Thread List */}
        <div
          ref={scrollContainerRef}
          className={styles.threadList}
          onScroll={handleScroll}
        >
          {isLoading && threads.length === 0 ? (
            <div className={styles.loading}>Carregando...</div>
          ) : threads.length === 0 ? (
            <div className={styles.empty}>
              {debouncedSearch
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda'}
            </div>
          ) : (
            groupedThreads.map((group) => (
              <div key={group.label} className={styles.group}>
                <div className={styles.groupLabel}>{group.label}</div>
                {group.threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isActive={thread.id === currentThreadId}
                    onSelect={() => handleSelectThread(thread.id)}
                    onDelete={(e) => handleDelete(thread.id, thread.title, e)}
                  />
                ))}
              </div>
            ))
          )}
          {isFetchingNextPage && (
            <div className={styles.loadingMore}>Carregando mais...</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ThreadItemProps {
  thread: AIThread;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ThreadItem({ thread, isActive, onSelect, onDelete }: ThreadItemProps) {
  const date = new Date(thread.updatedAt);

  return (
    <div
      className={`${styles.threadItem} ${isActive ? styles.threadItemActive : ''}`}
      onClick={onSelect}
    >
      <div className={styles.threadContent}>
        <span className={styles.threadTitle}>{thread.title}</span>
        <span className={styles.threadTime}>{formatRelativeTime(date)}</span>
      </div>
      <button
        className={styles.deleteButton}
        onClick={onDelete}
        title="Excluir conversa"
      >
        <DeleteOutline style={{ fontSize: 16 }} />
      </button>
    </div>
  );
}
