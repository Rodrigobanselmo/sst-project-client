/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { SEndButton } from 'components/atoms/SIconButton/SEndButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { selectGhoId, setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  setRiskAddInit,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SSaveIcon from 'assets/icons/SSaveIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { STBoxInput, STSInput } from './styles';
import { SideHeaderProps } from './types';

// eslint-disable-next-line react/display-name
export const SideHeader = React.forwardRef<any, SideHeaderProps>(
  ({ handleAddGHO, handleEditGHO, handleSelectGHO, isAddLoading }, ref) => {
    const dispatch = useAppDispatch();
    const selectedGhoId = useAppSelector(selectGhoId);

    return (
      <STBoxInput>
        <SFlex align="center" gap="1" mb={2}>
          <SIconButton
            onClick={() => {
              dispatch(setGhoOpen());
              dispatch(setRiskAddInit());
              handleSelectGHO(null, []);
            }}
            size="small"
          >
            <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
          <SText fontSize="0.9rem" color="GrayText">
            G.H.E
          </SText>
          <SIconButton
            onClick={() => {
              dispatch(setRiskAddToggleExpand());
            }}
            sx={{ ml: 'auto' }}
            size="small"
          >
            <Icon component={SExpandIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
        </SFlex>
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
      </STBoxInput>
    );
  },
);
