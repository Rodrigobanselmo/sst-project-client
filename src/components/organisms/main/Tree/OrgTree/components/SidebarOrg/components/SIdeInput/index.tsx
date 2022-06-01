/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import STooltip from 'components/atoms/STooltip';
import { selectGhoData } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { STSInput } from './styles';
import { SideInputProps } from './types';

// eslint-disable-next-line react/display-name
export const SideInput = React.forwardRef<any, SideInputProps>(
  ({ handleAddGHO, handleEditGHO, isAddLoading }, ref) => {
    const selectedGho = useAppSelector(selectGhoData);

    return (
      <STSInput
        endAdornment={
          <SFlex gap={2} center>
            <STooltip
              withWrapper
              title={selectedGho?.id ? 'Salvar' : 'Adicionar'}
            >
              <SEndButton bg={'tag.add'} onClick={() => handleAddGHO()} />
            </STooltip>
          </SFlex>
        }
        disabled
        loading={isAddLoading}
        size="small"
        variant="outlined"
        placeholder={'Adicionar novo G.S.E'}
        subVariant="search"
        inputRef={ref}
        onKeyDown={(e) => {
          if (e.key === 'Enter')
            if (selectedGho?.id) handleEditGHO(selectedGho);
            else handleAddGHO();
        }}
        fullWidth
      />
    );
  },
);
