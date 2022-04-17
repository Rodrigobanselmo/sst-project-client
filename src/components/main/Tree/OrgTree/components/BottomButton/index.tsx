import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { selectGhoOpen, setGhoOpen } from 'store/reducers/gho/ghoSlice';

import defaultTheme from 'configs/theme';

import SGhoIcon from 'assets/icons/SGhoIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);

  return (
    <>
      {!isGhoOpen && (
        <STooltip placement="left" title="Grupo homogênio de exposição">
          <SFlex
            onClick={() => dispatch(setGhoOpen())}
            gap={3}
            px={5}
            py={2}
            center
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 30,
              zIndex: defaultTheme.mixins.saveFeedback,
              backgroundColor: 'background.default',
              px: 5,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'background.box',
              },
              '&:active': {
                backgroundColor: 'background.lightGray',
              },
            }}
          >
            <Icon sx={{ color: 'gray.500' }} component={SGhoIcon} />
            <SText>G.H.E</SText>
          </SFlex>
        </STooltip>
      )}
    </>
  );
};
