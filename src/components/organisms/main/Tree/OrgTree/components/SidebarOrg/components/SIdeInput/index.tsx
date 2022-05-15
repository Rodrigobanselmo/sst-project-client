/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import STooltip from 'components/atoms/STooltip';
import { selectGhoData } from 'store/reducers/hierarchy/ghoSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SSaveIcon from 'assets/icons/SSaveIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { STSInput } from './styles';
import { SideInputProps } from './types';

// eslint-disable-next-line react/display-name
export const SideInput = React.forwardRef<any, SideInputProps>(
  ({ handleAddGHO, handleEditGHO, handleSelectGHO, isAddLoading }, ref) => {
    const selectedGho = useAppSelector(selectGhoData);

    return (
      <STSInput
        endAdornment={
          <SFlex gap={2} center>
            {selectedGho?.id && (
              <SIconButton
                onClick={() => handleSelectGHO(null, [])}
                size="small"
              >
                <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            )}
            <STooltip
              withWrapper
              title={selectedGho?.id ? 'Salvar' : 'Adicionar'}
            >
              <SEndButton
                icon={selectedGho?.id ? SSaveIcon : undefined}
                bg={selectedGho?.id ? 'info.main' : 'tag.add'}
                onClick={
                  selectedGho?.id
                    ? () => handleEditGHO(selectedGho)
                    : () => handleAddGHO()
                }
              />
            </STooltip>
          </SFlex>
        }
        loading={isAddLoading}
        size="small"
        variant="outlined"
        placeholder={'Adicionar novo G.H.E'}
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
