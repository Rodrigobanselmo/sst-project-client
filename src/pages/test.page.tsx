import React from 'react';

import { useAppDispatch } from '../core/hooks/useAppDispatch';
import { useAppSelector } from '../core/hooks/useAppSelector';
import {
  increment,
  selectExample,
} from '../store/reducers/example/exampleSlice';

const Page = () => {
  const exampleSelector = useAppSelector(selectExample);
  const dispatch = useAppDispatch();

  const exampleIncrement = () => {
    dispatch(increment());
  };

  return (
    <div>
      <button onClick={exampleIncrement}>Increment</button>
      <h1>{exampleSelector.value}</h1>
      <h1>{exampleSelector.status}</h1>
    </div>
  );
};

export default Page;
