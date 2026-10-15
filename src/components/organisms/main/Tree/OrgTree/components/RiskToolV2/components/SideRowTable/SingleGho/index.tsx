/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IExam } from 'core/interfaces/api/IExam';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { ProbabilityEstimateResult } from 'components/organisms/modals/ModalAddProbability/qualitative-probability.util';
import {
  controlsForProbabilityAssistant,
  originKindForWorkspaceProbabilityWrite,
  prepareWorkspaceProbabilityWrite,
  requiresWorkspaceProbabilityControls,
} from 'core/utils/workspace-probability-evaluation.util';
import { buildProbabilityCountSource } from 'components/organisms/modals/ModalAddProbability/use-live-employee-counts';

import { resolveOpenPlanWorkspaceId } from '../../../utils/existing-control-correspondence.util';
import { useColumnAction } from '../../../hooks/useColumnAction';
import { RowColumns } from '../components/RowColumns';
import { SideTableProps } from './types';

export const SideRowTable: FC<{ children?: any } & SideTableProps> = ({
  gho,
  riskData,
  isSelected,
  hide,
  riskGroupId,
  handleDeleteRiskData,
  isDeleteLoading,
}) => {
  const risk = useAppSelector(selectRisk);
  const viewData = useAppSelector((state) => state.riskAdd.viewData);
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const planWorkspaceId = useMemo(
    () =>
      resolveOpenPlanWorkspaceId({
        headerWorkspaceId,
        ghoId: gho?.id,
      }),
    [headerWorkspaceId, gho?.id],
  );
  const {
    onHandleSelectSave,
    enqueueSnackbar,
    onHandleHelp,
    onHandleEditEpi,
    onHandleEditEngs,
    onHandleRemoveSave,
    onHandleEditExams,
  } = useColumnAction();

  const isHierarchy = 'childrenIds' in gho;

  const handleSelect = async (values: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

    if (riskData?.isQuantity && values.probability) {
      enqueueSnackbar(
        'Você não pode mudar a probabilidade quando utilizado o método quantitativo.',
        {
          variant: 'warning',
          autoHideDuration: 3000,
        },
      );
      return;
    }

    const homoId = String(gho.id).split('//');
    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupId: homoId[0].split('//')[0],
      workspaceId: homoId.length == 2 ? homoId[1] : undefined,
      riskId: risk.id,
      riskFactorGroupDataId: riskGroupId as string,
      ...(isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
    } as IUpsertRiskData;

    const prepared = prepareWorkspaceProbabilityWrite({
      values: submitData,
      isQuantity: riskData?.isQuantity,
      originKind: originKindForWorkspaceProbabilityWrite({
        originKind: riskData?.originKind,
        viewDataType: viewData,
      }),
      headerWorkspaceId,
    });
    if (!prepared.ok) {
      enqueueSnackbar(prepared.message, { variant: 'warning' });
      return;
    }

    await onHandleSelectSave({ ...prepared.values }, riskData);
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

    const assistantControls = controlsForProbabilityAssistant(riskData, {
      requireWorkspaceControls: requiresWorkspaceProbabilityControls({
        isQuantity: riskData?.isQuantity,
        originKind: riskData?.originKind,
        viewDataType: viewData,
        headerWorkspaceId,
      }),
    });
    if (!assistantControls.available) {
      enqueueSnackbar(assistantControls.message, { variant: 'warning' });
      return;
    }

    onHandleHelp({
      gho,
      risk,
      adoptedCriteria: riskData?.probabilityCriteria,
      controls: assistantControls.controls,
      probabilityAuthority: riskData?.probabilityAuthority,
      probabilityOrigin: riskData?.probabilityOrigin,
      handleSelect: (value: ProbabilityEstimateResult) =>
        handleSelect({
          ...data,
          probability: value.probability,
          probabilityCriteria: value.criteria,
        }),
    });
  };

  const handleRemove = async (values: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupId: gho.id.split('//')[0],
      riskId: risk.id,
      riskFactorGroupDataId: riskGroupId as string,
    } as IUpsertRiskData;

    await onHandleRemoveSave(submitData, riskData);
  };

  const handleEditEpi = async (epi: IEpi) => {
    onHandleEditEpi(epi, (epis) => handleSelect({ epis }));
  };

  const handleEditEngs = async (eng: IRecMed) => {
    onHandleEditEngs(eng, (engs) => handleSelect({ engs }));
  };

  const handleEditExams = async (exam: IExam) => {
    onHandleEditExams(exam, (exams) => handleSelect({ exams }), risk?.type, risk ?? undefined);
  };

  return (
    <RowColumns
      isSelected={isSelected}
      hide={hide}
      handleSelect={handleSelect}
      handleHelp={handleHelp}
      handleRemove={handleRemove}
      riskData={riskData}
      risk={risk}
      handleEditEpi={handleEditEpi}
      handleEditEngs={handleEditEngs}
      handleEditExams={handleEditExams}
      isRepresentAll={risk?.representAll}
      showEndDate
      isDeleteLoading={isDeleteLoading}
      handleDeleteRiskData={() =>
        handleDeleteRiskData?.(riskData?.id as string, gho)
      }
      planWorkspaceId={planWorkspaceId}
      probabilityCountSource={buildProbabilityCountSource(
        gho,
        viewData,
        headerWorkspaceId,
      )}
    />
  );
};
