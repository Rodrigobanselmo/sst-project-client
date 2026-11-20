/* eslint-disable quotes */
import { riskEditorActionSx } from 'configs/theme/risk-editor-action';
import React, { FC } from 'react';

import { STagButton } from 'components/atoms/STagButton';

import { useAppSelector } from 'core/hooks/useAppSelector';

export const TotalTag: FC = () => {
  const ghoMulti = useAppSelector((state) => state.ghoMulti);
  const total =
    ghoMulti.selectedIds.length - ghoMulti.selectedDisabledIds.length;

  return (
    <STagButton
      sx={{
        ...riskEditorActionSx,
        pointerEvents: 'none',
        '&& .text_main': { color: 'text.secondary' },
      }}
      disabled
      text={`${total} Selecionados`}
      large
      mr={5}
    />
  );
};
