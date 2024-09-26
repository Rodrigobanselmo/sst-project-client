/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  DefaultError,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

type QueryKey = any[];

type InvalidateQueryKeyType<TData, TVariables, TContext> =
  | QueryKey
  | false
  | ((d: TData, v: TVariables, c: TContext) => QueryKey);

type InvalidateManyQueryKeysType<TData, TVariables, TContext> =
  | QueryKey[]
  | ((d: TData, v: TVariables, c: TContext) => QueryKey[]);

type InvalidateQueryKey<TData, TVariables, TContext> =
  | {
      invalidateQueryKey: InvalidateQueryKeyType<TData, TVariables, TContext>;
    }
  | {
      invalidateManyQueryKeys: InvalidateManyQueryKeysType<
        TData,
        TVariables,
        TContext
      >;
    };

export type IUseMutateProps<TData, TVariables, TError, TContext> =
  UseMutationOptions<TData, TError, TVariables, TContext> &
    InvalidateQueryKey<TData, TVariables, TContext>;

export const useMutate = <
  TData,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  params: IUseMutateProps<TData, TVariables, TError, TContext>,
) => {
  const queryClient = useQueryClient();

  function invalidateQueryKey(
    invalidateQueryKey: InvalidateQueryKeyType<TData, TVariables, TContext>,
    args: [data: TData, variables: TVariables, context: TContext],
  ) {
    if (typeof invalidateQueryKey === 'function') {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKey(...args),
        refetchType: 'all',
      });
    }

    if (
      typeof invalidateQueryKey === 'object' &&
      invalidateQueryKey.length > 0
    ) {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryKey,
        refetchType: 'all',
      });
    }
  }

  function invalidateManyQueryKeys(
    invalidateManyQueryKeys: InvalidateManyQueryKeysType<
      TData,
      TVariables,
      TContext
    >,
    args: [data: TData, variables: TVariables, context: TContext],
  ) {
    if (typeof invalidateManyQueryKeys === 'function') {
      invalidateManyQueryKeys(...args).forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey,
          refetchType: 'all',
        });
      });
    }

    if (
      Array.isArray(invalidateManyQueryKeys) &&
      invalidateManyQueryKeys.length > 0
    ) {
      invalidateManyQueryKeys.forEach((queryKey) => {
        if (queryKey.length > 0) {
          queryClient.invalidateQueries({
            queryKey,
            refetchType: 'all',
          });
        }
      });
    }
  }

  const mutate = useMutation<TData, TError, TVariables, TContext>({
    ...params,
    onSuccess: (...args) => {
      if ('invalidateQueryKey' in params)
        invalidateQueryKey(params.invalidateQueryKey, args);
      if ('invalidateManyQueryKeys' in params)
        invalidateManyQueryKeys(params.invalidateManyQueryKeys, args);

      params.onSuccess?.(...args);
    },
  });

  return mutate;
};
