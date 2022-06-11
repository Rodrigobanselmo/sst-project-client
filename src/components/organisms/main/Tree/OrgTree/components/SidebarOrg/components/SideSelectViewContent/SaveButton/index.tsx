import React, { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import { selectRiskDataSave } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';

export const SaveButton: FC = () => {
  const saveState = useAppSelector(selectRiskDataSave);

  const save = () => {
    document.getElementById('save-button-gho-select')?.click();
  };

  return (
    <SButton
      onClick={save}
      style={{ height: '30px', maxWidth: '20px' }}
      sx={!saveState.isEdited ? { backgroundColor: 'grey.400' } : {}}
      loading={saveState.isSaving}
    >
      Salvar
    </SButton>
  );
};
