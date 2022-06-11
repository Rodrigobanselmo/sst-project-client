/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';
import { useRouter } from 'next/router';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  setRiskAddState,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { SideTopProps } from './types';

export const SideTop: FC<SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
}) => {
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();
  const { onOpenModal } = useModal();
  const { companyId } = useGetCompanyId();
  const selectedRisk = useAppSelector(selectRisk);

  const handleSelectRisk = (options: IRiskFactors) => {
    console.log(options);
    if (options.id) dispatch(setRiskAddState({ risk: options }));
  };

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  return (
    <SFlex align="center" gap="1" mb={2}>
      <SIconButton onClick={handleCloseRisk} size="small">
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText fontSize="0.9rem" color="GrayText">
        Grupo similar de exposição
      </SText>

      {riskInit && (
        <SFlex center sx={{ ml: 'auto' }}>
          {typeof selectedRisk?.severity === 'number' && (
            <>
              <SText fontSize={15} color="text.light" mr={2}>
                Severidade
              </SText>
              <STag
                sx={{ px: 4, mr: 15, fontWeight: 'bold' }}
                text={String(selectedRisk?.severity)}
                action={String(selectedRisk?.severity) as any}
              />
            </>
          )}
          <STagButton text="Trocar View" large onClick={onChangeView} />
          <STooltip title="Adicionar GSE e Cargos por planilha excel">
            <STagButton
              large
              icon={SUploadIcon}
              onClick={() =>
                onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD, companyId)
              }
            />
          </STooltip>
          <RiskSelect
            id="risk-select-id"
            sx={{ minWidth: 230, mr: 5 }}
            large
            active={!!selectedRisk?.type}
            bg={
              selectedRisk?.type
                ? `risk.${selectedRisk.type.toLocaleLowerCase()}`
                : undefined
            }
            handleSelect={(options) =>
              handleSelectRisk(options as IRiskFactors)
            }
            text={selectedRisk ? selectedRisk.name : 'selecione um risco'}
            multiple={false}
          />

          <SIconButton
            onClick={() => {
              dispatch(setRiskAddToggleExpand());
            }}
            size="small"
          >
            <Icon component={SExpandIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
        </SFlex>
      )}
    </SFlex>
  );
};
