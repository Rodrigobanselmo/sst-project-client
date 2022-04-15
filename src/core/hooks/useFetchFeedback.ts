import { useEffect } from 'react';

import { setIsFetchingData } from 'store/reducers/routeLoad/routeLoadSlice';

import { useAppDispatch } from './useAppDispatch';

export const useFetchFeedback = (isLoading?: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log(isLoading);
    if (typeof isLoading === 'boolean') dispatch(setIsFetchingData(isLoading));
  }, [dispatch, isLoading]);

  return { dispatch };
};
