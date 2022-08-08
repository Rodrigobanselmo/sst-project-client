/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';
import { useStore } from 'react-redux';

import { Box } from '@mui/material';
import { RiskSelect } from 'components/organisms/tagSelects/RiskSelect';
import { useRouter } from 'next/router';
import {
  selectRisk,
  selectRiskDataSave,
  selectRisks,
  setRiskAddState,
} from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertManyRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertManyRiskData';
import { queryClient } from 'core/services/queryClient';

import { ViewTypeEnum } from '../../../utils/view-risk-type.constant';
import { SideTopProps } from '../types';

export const RiskToolTopButtonsSelectRisk: FC<Partial<SideTopProps>> = ({
  viewType,
}) => {
  const dispatch = useAppDispatch();
  const { companyId } = useGetCompanyId();
  const selectedRisks = useAppSelector(selectRisks);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const selectedRiskStore = useAppSelector(selectRisk);
  const saveState = useAppSelector(selectRiskDataSave);
  const { preventWarn } = usePreventAction();
  const store = useStore();
  const upsertRiskData = useMutUpsertManyRiskData();
  const { query } = useRouter();

  const isHierarchy = selectedGho && 'childrenIds' in selectedGho;

  const isViewTypeSelect = viewType == ViewTypeEnum.MULTIPLE;
  const isViewTypeGroup = viewType == ViewTypeEnum.SIMPLE_BY_GROUP;

  const selectedRisk: IRiskFactors | null = isViewTypeSelect
    ? selectedRisks[0]
    : selectedRiskStore;

  const handleSelectRisk = (options: string[] | IRiskFactors) => {
    if (Array.isArray(options)) {
      if (options?.length === 0) return;

      if (isViewTypeGroup) {
        const gho = selectedGho;

        if (gho?.id) {
          const homoId = String(gho.id).split('//');

          upsertRiskData.mutate({
            keepEmpty: true,
            homogeneousGroupIds: [homoId[0]],
            riskIds: options,
            riskFactorGroupDataId: query.riskGroupId as string,
            workspaceId: homoId.length == 2 ? homoId[1] : undefined,
            ...(isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
          });
        }

        return;
      }

      if (isViewTypeSelect) {
        //! if other company adds a risk it does not appear for me
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
      }
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
    dispatch(setRiskAddState({ isEdited: false }));
  };

  const textRisk = isViewTypeSelect
    ? selectedRisks
        .slice(0, 4)
        .map((risk) => risk.name)
        .join(' - ')
    : selectedRisk?.name;

  return (
    <RiskSelect
      onClick={() =>
        saveState.isEdited
          ? preventWarn(
              'Você tem certeza que deseja proceguir, você possui alterações não salvas?',
            )
          : null
      }
      id={IdsEnum.RISK_SELECT}
      sx={{ minWidth: 230, mr: 5, overflow: 'hidden' }}
      large
      disabled={isViewTypeGroup && !selectedGho}
      active={!!selectedRisk?.type || !!(isViewTypeGroup && selectedGho)}
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
      text={
        isViewTypeGroup
          ? 'Adicionar ricos'
          : selectedRisk
          ? textRisk
          : 'selecione um risco'
      }
      multiple={isViewTypeSelect || isViewTypeGroup ? true : false}
    />
  );
};
