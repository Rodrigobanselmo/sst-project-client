import {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useState,
  type DragEvent,
} from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Close from '@mui/icons-material/Close';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import HelpOutline from '@mui/icons-material/HelpOutline';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import Add from '@mui/icons-material/Add';
import Person from '@mui/icons-material/Person';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Stop from '@mui/icons-material/Stop';
import AttachFile from '@mui/icons-material/AttachFile';
import MicNone from '@mui/icons-material/MicNone';
import Check from '@mui/icons-material/Check';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import {
  useAIChat,
  PANEL_MIN_WIDTH,
  PANEL_MAX_WIDTH,
} from '../context/ai-chat-context';
import {
  useAIChatStream,
  type ChatMessage,
  type ChatMessageAttachment,
  type AIMode,
  DEFAULT_AI_MODE,
} from '../hooks/use-ai-chat-stream';
import { useAudioRecorder } from '../hooks/use-audio-recorder';
import { useFileAttachments } from '../hooks/use-file-attachments';
import {
  useQueryAIThreadMessages,
  useQueryAIThread,
  useCreateAIThreadMutation,
  useUpdateAIThreadMutation,
} from '../api/ai-thread.hooks';
import {
  formatRelativeTime,
  formatFullDateTime,
  getDateLabel,
  shouldShowDateSeparator,
} from '../utils/format-time';
import { usePageContext } from '../hooks/use-page-context';
import { ThreadHistory } from './thread-history';
import { AudioWaveform } from './audio-waveform';
import { AttachmentPreview } from './attachment-preview';
import { MessageAttachments } from './message-attachments';
import { ActionCard } from './action-card';
import { NavigationCard } from './navigation-card';
import { useSnackbar } from 'notistack';
import styles from './ai-chat-sidebar.module.css';

const AI_MODE_LABELS: Record<AIMode, string> = {
  fast: 'Rápido',
  smarter: 'Inteligente',
};

export function AIChatSidebar() {
  const {
    isOpen,
    close,
    currentThreadId,
    setCurrentThreadId,
    panelWidth,
    setPanelWidth,
  } = useAIChat();

  const [showHistory, setShowHistory] = useState(false);
  const [aiMode, setAiModeState] = useState<AIMode>(DEFAULT_AI_MODE);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  // Load AI mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('ai-chat-mode');
    if (savedMode === 'fast' || savedMode === 'smarter') {
      setAiModeState(savedMode);
    }
  }, []);

  // Save AI mode to localStorage when it changes
  const setAiMode = (mode: AIMode) => {
    setAiModeState(mode);
    localStorage.setItem('ai-chat-mode', mode);
  };

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useQueryAIThreadMessages(currentThreadId);
  const { data: threadData } = useQueryAIThread(currentThreadId);
  const createThreadMutation = useCreateAIThreadMutation();
  const updateThreadMutation = useUpdateAIThreadMutation();

  const currentThreadTitle = threadData?.title ?? 'Conversa sem título';

  const {
    messages: streamMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setMessages,
    interrupt,
  } = useAIChatStream();

  // Audio recording for voice input
  const {
    state: recordingState,
    error: recordingError,
    startRecording,
    stopRecording,
    cancelRecording,
    waveformData,
  } = useAudioRecorder();

  // File attachments for multimodal input
  const {
    attachments,
    isUploading,
    addFiles,
    removeAttachment,
    clearAttachments,
    getUploadedFileIds,
    getUploadedAttachments,
  } = useFileAttachments();

  // Track current page context for AI context awareness
  const pageContext = usePageContext();

  // Toast notifications
  const { enqueueSnackbar } = useSnackbar();

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasInput, setHasInput] = useState(false);
  const pendingTranscriptionRef = useRef<string | null>(null);
  const cursorPositionRef = useRef<number>(0);
  const savedInputValueRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const shouldScrollOnNextUpdate = useRef(false);
  const pendingScrollAction = useRef<
    | { type: 'initial' }
    | { type: 'restore'; prevScrollHeight: number; prevScrollTop: number }
    | null
  >({ type: 'initial' });
  const isLoadingMoreRef = useRef(false);

  // Pagination state from react-query infinite query
  const isLoadingMore = isFetchingNextPage;
  const isLoadingThread = isLoadingMessages && currentThreadId !== null;

  // Flatten all pages into messages array (pages are loaded in reverse for "before" pagination)
  const dbMessages =
    messagesData?.pages.flatMap((page) => page.edges.map((e) => e.node)) ?? [];

  // Track previous thread to detect thread changes
  const prevThreadIdRef = useRef<string | null>(null);

  // Clear messages when thread changes
  useEffect(() => {
    if (
      prevThreadIdRef.current !== null &&
      prevThreadIdRef.current !== currentThreadId
    ) {
      clearMessages();
      pendingScrollAction.current = { type: 'initial' };
    }
    prevThreadIdRef.current = currentThreadId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThreadId]);

  // Close mode dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modeDropdownRef.current &&
        !modeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModeDropdown(false);
      }
    };

    if (showModeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModeDropdown]);

  // Focus title input when editing starts and auto-resize
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      const textarea = titleInputRef.current;
      textarea.focus();
      textarea.select();
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [isEditingTitle]);

  // Sync messages from API when data arrives
  useEffect(() => {
    if (isLoading) return;

    // Helper to map DB attachments to ChatMessageAttachment format
    const mapAttachments = (
      atts: Array<{
        id: string;
        fileId: string;
        filename: string;
        mimeType: string;
        size: number;
        url?: string | null;
      }>,
    ): ChatMessageAttachment[] =>
      atts.map((f) => ({
        id: f.id,
        fileId: f.fileId,
        filename: f.filename,
        mimeType: f.mimeType,
        size: f.size,
        url: f.url ?? null,
      }));

    // Helper to map a single message (and create action cards if it has pending actions)
    const mapMessageWithActions = (
      m: (typeof dbMessages)[0],
    ): ChatMessage[] => {
      const baseMessage: ChatMessage = {
        role: m.role as 'user' | 'assistant' | 'tool' | 'action',
        content: m.content,
        toolName: m.toolName ?? undefined,
        toolStatus:
          (m.toolStatus as 'running' | 'success' | 'error') ?? undefined,
        toolDescription: m.toolDescription ?? undefined,
        timestamp: new Date(m.createdAt),
        files: m.attachments ? mapAttachments(m.attachments) : undefined,
      };

      const result: ChatMessage[] = [baseMessage];

      // If message has pending actions, create action cards for them
      if (m.pendingActions && m.pendingActions.length > 0) {
        for (const action of m.pendingActions) {
          result.push({
            role: 'action',
            content: '',
            timestamp: new Date(m.createdAt),
            actionData: {
              actionId: action.id,
              summary: action.summary || 'Ação pendente',
              details: (action as any).details || action.payload || {}, // Use formatted details if available, fallback to payload
              status: action.status.toLowerCase() as
                | 'pending'
                | 'executing'
                | 'completed'
                | 'failed'
                | 'cancelled',
            },
          });
        }
      }

      return result;
    };

    if (isLoadingMoreRef.current) {
      isLoadingMoreRef.current = false;
      if (dbMessages.length > 0) {
        const mapped = dbMessages.flatMap(mapMessageWithActions);
        setMessages(mapped);
      }
      return;
    }

    if (streamMessages.length > 0) return;

    if (dbMessages.length > 0) {
      const mapped = dbMessages.flatMap(mapMessageWithActions);
      setMessages(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData, isLoading]);

  // Handle scroll position restoration synchronously after DOM updates
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || streamMessages.length === 0) return;

    const action = pendingScrollAction.current;
    if (!action) return;

    if (action.type === 'restore') {
      const { prevScrollHeight, prevScrollTop } = action;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop =
        prevScrollTop + (newScrollHeight - prevScrollHeight);
    } else if (action.type === 'initial') {
      container.scrollTop = container.scrollHeight;
    }

    pendingScrollAction.current = null;
  }, [streamMessages]);

  // Handle loading older messages when scrolling up
  const handleLoadMoreMessages = useCallback(() => {
    if (!hasNextPage || isLoadingMore) return;

    const container = messagesContainerRef.current;
    if (container) {
      pendingScrollAction.current = {
        type: 'restore',
        prevScrollHeight: container.scrollHeight,
        prevScrollTop: container.scrollTop,
      };
    }

    isLoadingMoreRef.current = true;
    void fetchNextPage();
  }, [hasNextPage, isLoadingMore, fetchNextPage]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    isAtBottomRef.current = isAtBottom;

    if (container.scrollTop < 100 && hasNextPage && !isLoadingMore) {
      handleLoadMoreMessages();
    }
  }, [hasNextPage, isLoadingMore, handleLoadMoreMessages]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (shouldScrollOnNextUpdate.current) {
      shouldScrollOnNextUpdate.current = false;
      scrollToBottom();
      return;
    }

    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [streamMessages, scrollToBottom]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCreateThread = () => {
    setCurrentThreadId(null);
    clearMessages();
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input?.value.trim() && attachments.length === 0) return;

    const messageText = input?.value || '';
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }
    setHasInput(false);

    // Get file IDs and metadata before clearing attachments
    const fileIds = getUploadedFileIds();
    const attachmentMetadata = getUploadedAttachments();

    // Clear attachments after getting data
    clearAttachments();

    shouldScrollOnNextUpdate.current = true;

    // If no thread selected, create one first
    let threadIdToUse = currentThreadId;
    if (!threadIdToUse) {
      const result = await createThreadMutation.mutateAsync({
        title: messageText.slice(0, 50),
      });
      if (result) {
        threadIdToUse = result.id;
        setCurrentThreadId(threadIdToUse);
      }
    }

    void sendMessage({
      message: messageText,
      threadId: threadIdToUse,
      mode: aiMode,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
      attachments:
        attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
      pageContext,
    });
  };

  // Handle Enter to submit, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  // Auto-resize textarea as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    setHasInput(textarea.value.trim().length > 0);
  };

  const handleSuggestionClick = (text: string) => {
    if (inputRef.current) {
      inputRef.current.value = text;
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
      setHasInput(true);
    }
    void handleSubmit({
      preventDefault: () => {},
    } as React.BaseSyntheticEvent);
  };

  // Handle file attachment button click
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const rejected = await addFiles(files);
      if (rejected.length > 0) {
        const fileNames = rejected.map((f) => f.filename).join(', ');
        enqueueSnackbar(
          `Não foi possível enviar: ${fileNames}. Suportados: imagens, vídeos, áudio, PDF, Word, TXT, CSV, Excel.`,
          { variant: 'error' },
        );
      }
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Drag and drop handlers for full chat area
  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const rejected = await addFiles(files);
        if (rejected.length > 0) {
          const fileNames = rejected.map((f) => f.filename).join(', ');
          enqueueSnackbar(
            `Não foi possível enviar: ${fileNames}. Suportados: imagens, vídeos, áudio, PDF, Word, TXT, CSV, Excel.`,
            { variant: 'error' },
          );
        }
      }
    },
    [addFiles, enqueueSnackbar],
  );

  // Handle mic button click - start recording
  const handleMicClick = async () => {
    if (recordingState === 'idle') {
      // Save cursor position and input value before textarea gets unmounted
      if (inputRef.current) {
        savedInputValueRef.current = inputRef.current.value;
        cursorPositionRef.current =
          inputRef.current.selectionStart ?? inputRef.current.value.length;
      }
      await startRecording();
    }
  };

  // Handle confirm recording - stop and transcribe
  const handleConfirmRecording = async () => {
    if (recordingState !== 'recording') return;

    const transcribedText = await stopRecording();
    if (transcribedText) {
      // Store the transcribed text to be applied when textarea is available
      pendingTranscriptionRef.current = transcribedText;
    }
  };

  // Apply pending transcription when textarea becomes available (after recording UI hides)
  useEffect(() => {
    if (recordingState === 'idle' && inputRef.current) {
      const textarea = inputRef.current;
      const transcribedText = pendingTranscriptionRef.current;

      // Use saved input value (textarea was unmounted during recording)
      const savedValue = savedInputValueRef.current;
      const cursorPos = Math.min(cursorPositionRef.current, savedValue.length);

      if (transcribedText) {
        // Insert transcribed text at cursor position (with space padding if needed)
        pendingTranscriptionRef.current = null;

        const before = savedValue.slice(0, cursorPos);
        const after = savedValue.slice(cursorPos);
        const needsSpaceBefore = before.length > 0 && !before.endsWith(' ');
        const needsSpaceAfter = after.length > 0 && !after.startsWith(' ');

        const insertText =
          (needsSpaceBefore ? ' ' : '') +
          transcribedText +
          (needsSpaceAfter ? ' ' : '');

        const newValue = before + insertText + after;
        textarea.value = newValue;

        // Move cursor to end of inserted text
        const newCursorPos = cursorPos + insertText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();

        // Auto-resize after adding text
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        setHasInput(newValue.trim().length > 0);

        // Clear saved value
        savedInputValueRef.current = '';
      } else if (savedValue) {
        // No transcription but we have saved value - restore it (e.g., after cancel)
        textarea.value = savedValue;
        textarea.setSelectionRange(cursorPos, cursorPos);
        setHasInput(savedValue.trim().length > 0);
        savedInputValueRef.current = '';
      }
    }
  }, [recordingState]);

  // Handle cancel recording
  const handleCancelRecording = () => {
    cancelRecording();
  };

  // Resize handle logic
  const isResizing = useRef(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      // Right-side panel: width = window width - mouse X
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.min(
        Math.max(newWidth, PANEL_MIN_WIDTH),
        PANEL_MAX_WIDTH,
      );
      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setPanelWidth]);

  return (
    <aside
      className={`${styles.panel} ${!isOpen ? styles.panelClosed : ''}`}
      style={{ width: isOpen ? panelWidth : 0 }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDraggingOver && (
        <div className={styles.dropOverlay}>
          <div className={styles.dropOverlayContent}>
            <CloudUpload style={{ fontSize: 48 }} />
            <span>Solte os arquivos aqui</span>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.iconButton} onClick={close} title="Fechar">
            <Close style={{ fontSize: 18 }} />
          </button>
          {isEditingTitle ? (
            <textarea
              ref={titleInputRef}
              className={styles.headerTitleInput}
              value={editTitleValue}
              onChange={(e) => {
                setEditTitleValue(e.target.value);
                const textarea = e.target;
                textarea.style.height = 'auto';
                textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
              }}
              onBlur={() => {
                setIsEditingTitle(false);
                if (
                  editTitleValue.trim() &&
                  editTitleValue.trim() !== currentThreadTitle &&
                  currentThreadId
                ) {
                  updateThreadMutation.mutate({
                    id: currentThreadId,
                    title: editTitleValue.trim(),
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  titleInputRef.current?.blur();
                } else if (e.key === 'Escape') {
                  setEditTitleValue(currentThreadTitle);
                  setIsEditingTitle(false);
                }
              }}
              rows={1}
            />
          ) : (
            <h2
              className={styles.headerTitle}
              onClick={() => {
                if (currentThreadId) {
                  setEditTitleValue(currentThreadTitle);
                  setIsEditingTitle(true);
                }
              }}
              style={{ cursor: currentThreadId ? 'text' : 'default' }}
            >
              {currentThreadTitle}
            </h2>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconButton}
            onClick={handleCreateThread}
            title="Nova conversa"
          >
            <Add style={{ fontSize: 18 }} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => setShowHistory(true)}
            title="Histórico de conversas"
          >
            <HistoryOutlined style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Thread History Overlay */}
      {showHistory && (
        <ThreadHistory
          onClose={() => setShowHistory(false)}
          onSelectThread={handleSelectThread}
          currentThreadId={currentThreadId}
        />
      )}

      <div className={styles.content}>
        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className={styles.messages}
          onScroll={handleScroll}
        >
          {/* Loading indicator for older messages */}
          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <CircularProgress size={16} />
              <span>Carregando mensagens antigas...</span>
            </div>
          )}
          {/* Loading indicator when switching threads */}
          {isLoadingThread ? (
            <div className={styles.threadLoading}>
              <div className={styles.loadingSkeleton}>
                <div className={styles.skeletonRow}>
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                </div>
                <div className={styles.skeletonRow}>
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                </div>
              </div>
              <div
                className={styles.loadingSkeleton}
                style={{ marginTop: '1rem' }}
              >
                <div className={styles.skeletonRow}>
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                  <div className={styles.skeletonWord} />
                </div>
              </div>
            </div>
          ) : streamMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <Image
                  src="/icons/brand/ai.svg"
                  alt="AI"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className={styles.emptyStateTitle}>
                Como posso{' '}
                <span className={styles.emptyStateTitleHighlight}>
                  te ajudar?
                </span>
              </h3>
              <div className={styles.emptyStateSuggestions}>
                <button
                  type="button"
                  className={styles.suggestionButton}
                  onClick={() =>
                    handleSuggestionClick('Com o que você pode me ajudar?')
                  }
                >
                  <HelpOutline
                    style={{ fontSize: 20 }}
                    className={styles.suggestionIcon}
                  />
                  <span>Com o que você pode me ajudar?</span>
                </button>
                <button
                  type="button"
                  className={styles.suggestionButton}
                  onClick={() =>
                    handleSuggestionClick('Me mostre exemplos de prompts')
                  }
                >
                  <ChatBubbleOutline
                    style={{ fontSize: 20 }}
                    className={styles.suggestionIcon}
                  />
                  <span>Me mostre exemplos de prompts</span>
                </button>
              </div>
            </div>
          ) : (
            streamMessages.map((msg, index) => {
              const prevMsg: ChatMessage | undefined =
                streamMessages[index - 1];
              const showDateSeparator = shouldShowDateSeparator(
                msg.timestamp,
                prevMsg?.timestamp ?? null,
              );

              // Agent messages
              if (msg.role === 'agent') {
                return (
                  <div key={index} className={styles.agentMessage}>
                    <span className={styles.agentBadge}>{msg.agentName}</span>
                  </div>
                );
              }

              // Navigation card messages
              if (msg.role === 'navigation' && msg.navigationData) {
                return (
                  <div key={index} className={styles.actionMessageContainer}>
                    <NavigationCard data={msg.navigationData} />
                  </div>
                );
              }

              // Action card messages
              if (msg.role === 'action' && msg.actionData) {
                return (
                  <div key={index} className={styles.actionMessageContainer}>
                    <ActionCard
                      actionId={msg.actionData.actionId}
                      summary={msg.actionData.summary}
                      details={msg.actionData.details}
                      status={msg.actionData.status}
                      onStatusChange={(actionId, newStatus) => {
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.actionData?.actionId === actionId
                              ? {
                                  ...m,
                                  actionData: {
                                    ...m.actionData!,
                                    status: newStatus,
                                  },
                                }
                              : m,
                          ),
                        );
                      }}
                    />
                  </div>
                );
              }

              // Tool messages
              if (msg.role === 'tool') {
                const displayContent = msg.toolDescription
                  ? msg.toolStatus === 'success'
                    ? `\u2713 ${msg.toolDescription}`
                    : msg.toolStatus === 'error'
                      ? `\u2717 ${msg.toolDescription}`
                      : msg.toolDescription
                  : msg.content;

                return (
                  <div
                    key={index}
                    className={`${styles.toolMessage} ${
                      msg.toolStatus === 'running'
                        ? styles.toolRunning
                        : msg.toolStatus === 'success'
                          ? styles.toolSuccess
                          : styles.toolError
                    }`}
                  >
                    {msg.toolStatus === 'running' && (
                      <span className={styles.toolSpinner}>&#9203;</span>
                    )}
                    {displayContent}
                  </div>
                );
              }

              const isUser = msg.role === 'user';
              const isStreaming =
                !isUser &&
                isLoading &&
                index === streamMessages.length - 1 &&
                !msg.content;

              return (
                <div key={index}>
                  {/* Date Separator */}
                  {showDateSeparator && (
                    <div className={styles.dateSeparator}>
                      <span className={styles.dateSeparatorLine} />
                      <span className={styles.dateSeparatorText}>
                        {getDateLabel(msg.timestamp)}
                      </span>
                      <span className={styles.dateSeparatorLine} />
                    </div>
                  )}

                  {/* Message */}
                  <div className={styles.messageWrapper}>
                    {/* Avatar and Header */}
                    <div className={styles.messageHeader}>
                      {isUser ? (
                        <div className={styles.userAvatar}>
                          <Person style={{ fontSize: 14 }} />
                        </div>
                      ) : (
                        <Image
                          src="/icons/brand/ai.svg"
                          alt="AI"
                          width={20}
                          height={20}
                          className={styles.aiAvatar}
                        />
                      )}
                      {isUser && <span className={styles.userLabel}>Você</span>}
                      <span
                        className={styles.messageTime}
                        title={formatFullDateTime(msg.timestamp)}
                      >
                        {formatRelativeTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message Content */}
                    {isStreaming ? (
                      <div className={styles.loadingSkeleton}>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                        <div className={styles.skeletonRow}>
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                          <div className={styles.skeletonWord} />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`${styles.message} ${
                          isUser ? styles.messageUser : styles.messageAssistant
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                        {/* Render file attachments if present */}
                        {msg.files && msg.files.length > 0 && (
                          <MessageAttachments files={msg.files} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {/* AI Thinking indicator */}
          {isLoading &&
            streamMessages.length > 0 &&
            (() => {
              const lastMsg = streamMessages.at(-1);
              if (lastMsg?.role === 'user') {
                return (
                  <div className={styles.messageWrapper}>
                    <div className={styles.messageHeader}>
                      <Image
                        src="/icons/brand/ai.svg"
                        alt="AI"
                        width={20}
                        height={20}
                        className={styles.aiAvatar}
                      />
                      <span className={styles.messageTime}>now</span>
                    </div>
                    <div
                      className={`${styles.message} ${styles.messageAssistant}`}
                    >
                      <span className={styles.thinkingIndicator}>
                        <span className={styles.thinkingDot} />
                        <span className={styles.thinkingDot} />
                        <span className={styles.thinkingDot} />
                      </span>
                    </div>
                  </div>
                );
              } else if (lastMsg?.role === 'tool') {
                return (
                  <div className={styles.thinkingIndicator}>
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                    <span className={styles.thinkingDot} />
                  </div>
                );
              }
              return null;
            })()}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {(error ?? recordingError) && (
        <div className={styles.error}>{error ?? recordingError}</div>
      )}

      {/* Input - Show recording UI or normal input */}
      {recordingState === 'recording' || recordingState === 'transcribing' ? (
        /* Recording UI - Only waveform and cancel/confirm buttons */
        <div className={styles.inputContainer}>
          <div className={styles.recordingWrapper}>
            {/* Cancel button on the left */}
            <button
              type="button"
              className={styles.recordingCancelButton}
              onClick={handleCancelRecording}
              disabled={recordingState === 'transcribing'}
              title="Cancelar gravação"
            >
              <Close style={{ fontSize: 18 }} />
            </button>

            {/* Center: Waveform visualization */}
            <div className={styles.waveformContainer}>
              {recordingState === 'transcribing' ? (
                <div className={styles.transcribingIndicator}>
                  <CircularProgress size={18} />
                  <span>Transcrevendo...</span>
                </div>
              ) : (
                <AudioWaveform data={waveformData} isRecording />
              )}
            </div>

            {/* Confirm button on the right */}
            <button
              type="button"
              className={styles.recordingConfirmButton}
              onClick={handleConfirmRecording}
              disabled={recordingState === 'transcribing'}
              title="Confirmar e transcrever"
            >
              <Check style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      ) : (
        /* Normal input UI */
        <form className={styles.inputContainer} onSubmit={handleSubmit}>
          {/* Attachment previews */}
          <AttachmentPreview
            attachments={attachments}
            onRemove={removeAttachment}
          />
          <div className={styles.inputWrapper}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {/* Top row: textarea */}
            <div className={styles.inputTop}>
              <textarea
                ref={inputRef}
                className={styles.input}
                placeholder="Digite uma mensagem..."
                disabled={isLoading || isUploading}
                rows={1}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
              />
            </div>
            {/* Bottom row: actions */}
            <div className={styles.inputBottom}>
              <div className={styles.inputLeftActions}>
                <button
                  type="button"
                  className={styles.inputActionButton}
                  title="Anexar arquivo"
                  disabled={isLoading || isUploading}
                  onClick={handleAttachClick}
                >
                  <AttachFile style={{ fontSize: 18 }} />
                </button>
              </div>
              <div className={styles.inputRightActions}>
                {/* Mode dropdown */}
                <div
                  className={styles.modeDropdownContainer}
                  ref={modeDropdownRef}
                >
                  <button
                    type="button"
                    className={styles.modeDropdownButton}
                    onClick={() => setShowModeDropdown(!showModeDropdown)}
                    disabled={isLoading}
                  >
                    {AI_MODE_LABELS[aiMode]}
                    <ExpandMore style={{ fontSize: 14 }} />
                  </button>
                  {showModeDropdown && (
                    <div className={styles.modeDropdownMenu}>
                      <button
                        type="button"
                        className={`${styles.modeDropdownItem} ${aiMode === 'fast' ? styles.modeDropdownItemActive : ''}`}
                        onClick={() => {
                          setAiMode('fast');
                          setShowModeDropdown(false);
                        }}
                      >
                        {AI_MODE_LABELS.fast}
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeDropdownItem} ${aiMode === 'smarter' ? styles.modeDropdownItemActive : ''}`}
                        onClick={() => {
                          setAiMode('smarter');
                          setShowModeDropdown(false);
                        }}
                      >
                        {AI_MODE_LABELS.smarter}
                      </button>
                    </div>
                  )}
                </div>
                {/* Microphone button */}
                <button
                  type="button"
                  className={styles.inputActionButton}
                  title="Entrada de voz"
                  onClick={handleMicClick}
                  disabled={isLoading || isUploading}
                >
                  <MicNone style={{ fontSize: 18 }} />
                </button>
                {/* Submit/Interrupt button */}
                {isLoading ? (
                  <button
                    type="button"
                    className={`${styles.submitButton} ${styles.submitButtonInterrupt}`}
                    onClick={interrupt}
                    title="Parar geração"
                  >
                    <Stop style={{ fontSize: 14 }} />
                  </button>
                ) : isUploading ? (
                  <button
                    type="button"
                    className={styles.submitButton}
                    disabled
                    title="Enviando arquivos..."
                  >
                    <CircularProgress size={18} style={{ color: 'white' }} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!hasInput && attachments.length === 0}
                    title="Enviar mensagem"
                  >
                    <ArrowUpward style={{ fontSize: 18 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </aside>
  );
}
