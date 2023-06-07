import { useEffect } from 'react';

import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from './useAppDispatch';

export const useFetchFeedback = (isLoading?: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof isLoading === 'boolean') dispatch(setIsFetchingData(isLoading));

    return () => {
      dispatch(setIsFetchingData(false));
    };
  }, [dispatch, isLoading]);

  return { dispatch };
};
