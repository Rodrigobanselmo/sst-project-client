/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { useStore } from 'react-redux';

import { Box, Icon } from '@mui/material';
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
  selectRiskDataSave,
  selectRisks,
  setRiskAddState,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryClient } from 'core/services/queryClient';

import { ViewTypeEnum } from '../../utils/view-type.enum';
import { SideTopProps } from './types';

export const SideTop: FC<SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
  viewType,
}) => {
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();
  const { onOpenModal } = useModal();
  const { companyId, user } = useGetCompanyId();
  const selectedRisks = useAppSelector(selectRisks);
  const selectedRiskStore = useAppSelector(selectRisk);
  const saveState = useAppSelector(selectRiskDataSave);
  const { preventWarn } = usePreventAction();
  const store = useStore();

  const isViewTypeSelect = viewType == ViewTypeEnum.SELECT;

  const selectedRisk: IRiskFactors | null = isViewTypeSelect
    ? selectedRisks[0]
    : selectedRiskStore;

  const handleSelectRisk = (options: string[] | IRiskFactors) => {
    if (Array.isArray(options)) {
      if (options?.length === 0) return;

      const companyId = user?.companyId;
      const allRisks = queryClient.getQueryData<IRiskFactors[]>([
        QueryEnum.RISK,
        companyId,
      ]);

      if (!allRisks) return;

      const selectedRisks = allRisks.filter((risk) =>
        options.includes(risk.id),
      );
      dispatch(
        setRiskAddState({ risks: selectedRisks, risk: selectedRisks[0] }),
      );
    } else {
      if (options.id) {
        const risks = (store.getState().riskAdd.risks || []) as IRiskFactors[];
        const risk = risks.find((risk) => risk.id === options.id);
        dispatch(
          setRiskAddState({
            risk: options,
            risks: risk ? risks : [options],
          }),
        );
      }
    }
  };

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  const severity = selectedRisks.length > 1 ? '-' : selectedRisk?.severity;
  const textRisk = isViewTypeSelect
    ? selectedRisks
        .slice(0, 4)
        .map((risk) => risk.name)
        .join(' - ')
    : selectedRisk?.name;

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
          <SText fontSize={15} color="text.light" mr={2}>
            Severidade
          </SText>
          <STag
            sx={{ px: 4, mr: 15, fontWeight: 'bold' }}
            text={severity ? String(severity) : '0'}
            action={String(severity) as any}
          />

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
            onClick={() =>
              saveState.isEdited
                ? preventWarn(
                    'Você tem certeza que deseja proceguir, você possui alterações não salvas?',
                  )
                : null
            }
            id="risk-select-id"
            sx={{ minWidth: 230, mr: 5 }}
            large
            active={!!selectedRisk?.type}
            tooltipTitle={
              isViewTypeSelect &&
              selectedRisk && (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {selectedRisks.map((risk) => (
                    <p key={risk.id}>{risk.name}</p>
                  ))}
                </Box>
              )
            }
            bg={
              selectedRisk?.type
                ? `risk.${selectedRisk.type.toLocaleLowerCase()}`
                : undefined
            }
            handleSelect={(options) => handleSelectRisk(options as string[])}
            text={selectedRisk ? textRisk : 'selecione um risco'}
            multiple={isViewTypeSelect ? true : false}
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
