import React, { FC } from 'react';

import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';

export const ProbabilityColumn: FC<ProbabilityColumnProps> = ({
  handleSelect,
  data,
}) => {
  const dataSelect = {} as Partial<IUpsertRiskData>;

  if (
    data &&
    data.probability &&
    data.probabilityAfter &&
    data.probability < data.probabilityAfter
  )
    dataSelect.probabilityAfter = undefined;

  return (
    <SelectedNumber
      handleSelect={(number) =>
        handleSelect({ probability: number, ...dataSelect })
      }
      selectedNumber={data?.probability}
      disabledGtEqual={6}
    />
  );
};
