/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import STooltip from 'components/atoms/STooltip';
import { selectGhoId } from 'store/reducers/hierarchy/ghoSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SSaveIcon from 'assets/icons/SSaveIcon';

import { useAppSelector } from 'core/hooks/useAppSelector';

import { STSInput } from './styles';
import { SideInputProps } from './types';

// eslint-disable-next-line react/display-name
export const SideInput = React.forwardRef<any, SideInputProps>(
  ({ handleAddGHO, handleEditGHO, handleSelectGHO, isAddLoading }, ref) => {
    const selectedGhoId = useAppSelector(selectGhoId);

    return (
      <STSInput
        endAdornment={
          <SFlex gap={2} center>
            {selectedGhoId && (
              <SIconButton
                onClick={() => handleSelectGHO(null, [])}
                size="small"
              >
                <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
              </SIconButton>
            )}
            <STooltip
              withWrapper
              title={selectedGhoId ? 'Salvar' : 'Adicionar'}
            >
              <SEndButton
                icon={selectedGhoId ? SSaveIcon : undefined}
                bg={selectedGhoId ? 'info.main' : 'tag.add'}
                onClick={
                  selectedGhoId
                    ? () => handleEditGHO(selectedGhoId)
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
            if (selectedGhoId) handleEditGHO(selectedGhoId);
            else handleAddGHO();
        }}
        fullWidth
      />
    );
  },
);
