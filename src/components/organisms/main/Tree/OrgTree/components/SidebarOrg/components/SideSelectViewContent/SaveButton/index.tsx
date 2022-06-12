/* eslint-disable quotes */
import React, { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import { selectRiskDataSave } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { usePreventAction } from 'core/hooks/usePreventAction';

export const SaveButton: FC = () => {
  const saveState = useAppSelector(selectRiskDataSave);
  const { preventDelete } = usePreventAction();
  const save = () => {
    document.getElementById('save-button-gho-select')?.click();
  };

  const onDelete = () => {
    preventDelete(
      () => document.getElementById('delete-button-gho-select')?.click(),
      "Ao clicar no botão 'Deletar', você excluirá todos os dados referentes aos risco selecionados para os grupos homogênios ativos. Deseja continuar?",
      { inputConfirm: true },
    );
  };

  return (
    <>
      <SButton
        onClick={onDelete}
        style={{ height: '30px' }}
        sx={{ backgroundColor: 'grey.400' }}
        loading={saveState.isSaving}
      >
        Limpar dados
      </SButton>
      <SButton
        onClick={save}
        style={{ height: '30px', maxWidth: '20px' }}
        sx={!saveState.isEdited ? { backgroundColor: 'grey.400' } : {}}
        loading={saveState.isSaving}
      >
        Adicionar
      </SButton>
    </>
  );
};
