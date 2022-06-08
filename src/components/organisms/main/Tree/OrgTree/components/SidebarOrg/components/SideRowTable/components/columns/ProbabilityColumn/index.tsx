import React, { FC } from 'react';

import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';

export const ProbabilityColumn: FC<ProbabilityColumnProps> = ({
  handleSelect,
  data,
  handleHelp,
}) => {
  const dataSelect = {} as Partial<IUpsertRiskData>;

  if (
    data &&
    data.probability &&
    data.probabilityAfter &&
    data.probability < data.probabilityAfter
  )
    dataSelect.probabilityAfter = undefined;

  const setProbability = (prob: number) => {
    if (data?.probability && prob && prob === data?.probability) return 0;

    return prob;
  };

  return (
    <>
      <SelectedNumber
        handleSelect={(number) =>
          handleSelect({ probability: setProbability(number), ...dataSelect })
        }
        selectedNumber={data?.probability}
        disabledGtEqual={6}
        handleHelp={() => handleHelp && handleHelp(dataSelect)}
      />
    </>
  );
};
