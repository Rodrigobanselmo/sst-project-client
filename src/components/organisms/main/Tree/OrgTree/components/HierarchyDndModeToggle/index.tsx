import React, { FC } from 'react';

import OpenWithOutlinedIcon from '@mui/icons-material/OpenWithOutlined';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import {
  selectHierarchyCopyDndActive,
  setCopyDndActive,
} from 'store/reducers/hierarchy/hierarchySlice';

import { SCopyIcon } from 'assets/icons/SCopyIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

export const HierarchyDndModeToggle: FC = () => {
  const dispatch = useAppDispatch();
  const copyDndActive = useAppSelector(selectHierarchyCopyDndActive);

  return (
    <SFlex align="center" gap={2}>
      <STagButton
        large
        text="Mover"
        icon={OpenWithOutlinedIcon}
        active={!copyDndActive}
        tooltipTitle="Transfere a estrutura existente para o destino. Trabalhadores vinculados acompanham a movimentação."
        onClick={() => dispatch(setCopyDndActive(false))}
      />
      <STagButton
        large
        text="Copiar"
        icon={SCopyIcon}
        active={copyDndActive}
        tooltipTitle="Cria uma nova estrutura no destino. Trabalhadores, GSE, riscos e demais dados de SST não são copiados."
        onClick={() => dispatch(setCopyDndActive(true))}
      />
    </SFlex>
  );
};
