import React, { FC } from 'react';

import { CircularProgress } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { selectSave } from 'store/reducers/save/saveSlice';

import defaultTheme from 'configs/theme';

import { SaveEnum } from 'core/enums/save.enum';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useChecklistTreeActions } from 'core/hooks/useChecklistTreeActions';

export const LoadingFeedback: FC = () => {
  const saveDocument = useAppSelector(selectSave(SaveEnum.CHECKLIST));
  const { saveMutation } = useChecklistTreeActions();

  return (
    <>
      <SFlex
        center
        sx={{
          position: 'absolute',
          bottom: 25,
          left: 30,
          zIndex: defaultTheme.mixins.saveFeedback,
          backgroundColor: 'background.default',
          px: 5,
          borderRadius: 1,
        }}
      >
        {saveMutation.isLoading || saveDocument ? (
          <>
            <CircularProgress size={15} />
            <SText color="text.light" fontSize={18} sx={{ ml: 3 }}>
              salvando...
            </SText>
          </>
        ) : (
          <SText color="text.light" fontSize={18} sx={{ ml: 3 }}>
            salvo
          </SText>
        )}
      </SFlex>
    </>
  );
};
