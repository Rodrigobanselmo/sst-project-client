import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createThread,
  listThreads,
  getThread,
  updateThread,
  deleteThread,
  getMessages,
  type AIThread,
  type AIThreadConnection,
  type AIMessageConnection,
} from "./ai-thread.api";

// Query keys
export const aiThreadKeys = {
  all: ["ai-threads"] as const,
  lists: () => [...aiThreadKeys.all, "list"] as const,
  list: (params?: { search?: string | null }) =>
    [...aiThreadKeys.lists(), params] as const,
  details: () => [...aiThreadKeys.all, "detail"] as const,
  detail: (id: string) => [...aiThreadKeys.details(), id] as const,
  messages: (threadId: string) =>
    [...aiThreadKeys.all, "messages", threadId] as const,
};

// Hooks

export function useQueryAIThreads(params?: {
  first?: number;
  search?: string | null;
}) {
  return useInfiniteQuery<AIThreadConnection>({
    queryKey: aiThreadKeys.list({ search: params?.search }),
    queryFn: ({ pageParam }) =>
      listThreads({
        first: params?.first ?? 20,
        after: pageParam as string | undefined,
        search: params?.search,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useQueryAIThread(threadId: string | null) {
  return useQuery<AIThread | null>({
    queryKey: aiThreadKeys.detail(threadId ?? ""),
    queryFn: () => (threadId ? getThread(threadId) : null),
    enabled: !!threadId,
  });
}

export function useQueryAIThreadMessages(
  threadId: string | null,
  params?: { first?: number }
) {
  return useInfiniteQuery<AIMessageConnection>({
    queryKey: aiThreadKeys.messages(threadId ?? ""),
    queryFn: ({ pageParam }) =>
      getMessages(threadId!, {
        first: params?.first ?? 20,
        before: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!threadId,
  });
}

export function useCreateAIThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: { title?: string }) => createThread(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiThreadKeys.lists() });
    },
  });
}

export function useUpdateAIThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateThread(id, { title }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: aiThreadKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: aiThreadKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteAIThreadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiThreadKeys.lists() });
    },
  });
}

export type { AIThread, AIThreadConnection, AIMessageConnection };
