import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import {
  selectGhoOpen,
  setGhoOpen,
  setGhoState,
  setGhoSearch,
  setGhoSearchSelect,
} from 'store/reducers/hierarchy/ghoSlice';

import SGhoIcon from 'assets/icons/SGhoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useModal } from 'core/hooks/useModal';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';

import { SFlexButton } from './styles';

export const BottomButton: FC = () => {
  const dispatch = useAppDispatch();
  const isGhoOpen = useAppSelector(selectGhoOpen);
  const { onOpenModal } = useModal();
  const { query, asPath, push } = useRouter();

  const isRiskOpen = query.riskGroupId;

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
  };

  const handleRiskData = () => {
    if (!isRiskOpen)
      onOpenModal(ModalEnum.DOC_PGR_SELECT, {
        onSelect: (docPgr: IRiskGroupData) => {
          push(asPath + '/?riskGroupId=' + docPgr.id, undefined, {
            shallow: true,
          });
        },
      } as Partial<typeof initialDocPgrSelectState>);
    else handleCloseRisk();
  };

  return (
    <SFlex
      sx={{
        bottom: 20,
        right: 30,
        position: 'absolute',
      }}
    >
      <STooltip placement="top" title="Vincular Fatores de Risco">
        <SFlexButton
          onClick={() => {
            handleRiskData();
            dispatch(setGhoOpen(false));
          }}
          active={isRiskOpen ? 1 : 0}
          gap={4}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon sx={{ color: 'gray.500' }} component={SRiskFactorIcon} />
          <SText>Fatores de Risco</SText>
        </SFlexButton>
      </STooltip>
      <STooltip placement="top-start" title="Grupo homogênio de exposição">
        <SFlexButton
          active={isGhoOpen ? 1 : 0}
          onClick={() => {
            // handleCloseRisk();
            dispatch(setGhoState({ hierarchies: [], data: null }));
            dispatch(setGhoOpen());
            dispatch(setGhoSearch(''));
            dispatch(setGhoSearchSelect(''));
          }}
          gap={3}
          px={5}
          py={2}
          pr={6}
          center
        >
          <Icon component={SGhoIcon} />
          <SText>GSE</SText>
        </SFlexButton>
      </STooltip>
    </SFlex>
  );
};
