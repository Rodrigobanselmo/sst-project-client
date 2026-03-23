/* eslint-disable quotes */
import React, { FC } from 'react';

import { STagButton } from 'components/atoms/STagButton';

import { useAppSelector } from 'core/hooks/useAppSelector';

export const TotalTag: FC = () => {
  const ghoMulti = useAppSelector((state) => state.ghoMulti);
  const total =
    ghoMulti.selectedIds.length - ghoMulti.selectedDisabledIds.length;

  return <STagButton disabled text={`${total} Selecionados`} large mr={5} />;
};
