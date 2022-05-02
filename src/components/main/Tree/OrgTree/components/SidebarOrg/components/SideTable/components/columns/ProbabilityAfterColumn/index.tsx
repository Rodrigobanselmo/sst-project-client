import React, { FC } from 'react';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';

export const ProbabilityAfterColumn: FC<ProbabilityColumnProps> = ({
  handleSelect,
  data,
}) => {
  let disabled = true;

  if (data.rec && data.rec.length) disabled = false;

  return (
    <>
      <SelectedNumber
        handleSelect={(number) => handleSelect({ probabilityAfter: number })}
        selectedNumber={data.probabilityAfter}
        disabledGtEqual={
          disabled ? 0 : data.probability ? data.probability + 1 : 0
        }
      />
    </>
  );
};
