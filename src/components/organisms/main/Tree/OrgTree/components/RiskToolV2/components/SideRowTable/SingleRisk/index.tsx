import type { AiRiskOccurrenceIdentity } from '../../../risk-factors-ai/by-risk-occurrence/ai-risk-occurrence.identity';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { useRouter } from 'next/router';

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
import {
  buildRiskDataUpsertWorkspaceFields,
  isRiskToolHierarchyUpsertContext,
} from '../build-risk-data-upsert-workspace-fields.util';
import { resolveRiskToolOccurrenceSaveTarget } from '../resolve-risk-tool-occurrence-save-target.util';
import { RowColumns } from '../components/RowColumns';
import { RiskToolSingleRiskRowProps } from './types';
import { EsocialCodeEnum } from 'core/enums/esocial-code.enum';

export const RiskToolSingleRiskRow: FC<
  { children?: any } & RiskToolSingleRiskRowProps
> = ({
  risk,
  riskData,
  hide,
  riskGroupId,
  isRepresentAll,
  readOnly = false,
  originHomogeneousGroupId,
  planWorkspaceIdOverride,
  targetGho,
}) => {
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const gho = targetGho ?? selectedGho;
  const viewData = useAppSelector((state) => state.riskAdd.viewData);
  const { query } = useRouter();
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const isOriginEdit = !!originHomogeneousGroupId;
  const planWorkspaceId = useMemo(
    () =>
      resolveOpenPlanWorkspaceId({
        override: planWorkspaceIdOverride,
        headerWorkspaceId,
        ghoId: gho?.id,
      }),
    [planWorkspaceIdOverride, headerWorkspaceId, gho?.id],
  );
  const {
    onHandleSelectSave,
    enqueueSnackbar,
    onHandleHelp,
    onHandleEditEpi,
    onHandleEditEngs,
    onHandleRemoveSave,
    onHandleEditExams,
    upsertRiskData,
  } = useColumnAction();

  const handleSelect = async (values: Partial<IUpsertRiskData>, context?: { occurrence: AiRiskOccurrenceIdentity }) => {
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    if (!risk?.id) return;
    const saveTarget = resolveRiskToolOccurrenceSaveTarget({
      originHomogeneousGroupId,
      selectedGhoId: gho?.id,
      riskFactorDataId: riskData?.id,
    });
    if (!saveTarget) return;
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

    // Contexto semântico da tela (riskAdd.viewData), não `childrenIds` no GHO.
    const isHierarchy = isRiskToolHierarchyUpsertContext({
      viewData,
      isOriginEdit,
    });
    const selectedParts = String(gho?.id || '').split('//');

    const submitData = {
      ...values,
      id: saveTarget.riskFactorDataId,
      homogeneousGroupId: saveTarget.homogeneousGroupId,
      riskId: risk.id,
      riskFactorGroupDataId: riskGroupId as string,
      ...buildRiskDataUpsertWorkspaceFields({
        isHierarchy,
        hierarchyWorkspaceId: selectedParts[1],
        explicitWorkspaceId: values.workspaceId,
        routeWorkspaceId: query.workspaceId,
        tabWorkspaceId: query.tabWorkspaceId,
      }),
      ...(context?.occurrence ? { occurrence: context.occurrence, workspaceId: context.occurrence.workspaceId } : {}),
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

    await onHandleSelectSave({ ...prepared.values }, riskData, { keepEmpty: true });
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    if (!risk?.id || (!isOriginEdit && !gho?.id)) return;
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
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    if (!risk?.id) return;
    const saveTarget = resolveRiskToolOccurrenceSaveTarget({
      originHomogeneousGroupId,
      selectedGhoId: gho?.id,
      riskFactorDataId: riskData?.id,
    });
    if (!saveTarget) return;

    const submitData = {
      ...values,
      id: saveTarget.riskFactorDataId,
      homogeneousGroupId: saveTarget.homogeneousGroupId,
      riskId: risk.id,
      riskFactorGroupDataId: riskGroupId as string,
      keepEmpty: true,
    } as IUpsertRiskData;

    await onHandleRemoveSave(submitData, riskData);
  };

  const handleEditEpi = async (epi: IEpi) => {
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    onHandleEditEpi(epi, (epis) => handleSelect({ epis }));
  };

  const handleEditEngs = async (eng: IRecMed) => {
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    onHandleEditEngs(eng, (engs) => handleSelect({ engs }));
  };

  const handleEditExams = async (exam: IExam) => {
    if (!isOriginEdit && (readOnly || riskData?.canEditOnThisEntity === false)) {
      return;
    }
    onHandleEditExams(exam, (exams) => handleSelect({ exams }), risk?.type, risk);
  };

  return (
    <RowColumns
      isLoading={upsertRiskData.isLoading}
      hide={hide}
      handleSelect={handleSelect}
      handleHelp={handleHelp}
      handleRemove={handleRemove}
      riskData={riskData}
      handleEditExams={handleEditExams}
      risk={risk}
      handleEditEpi={handleEditEpi}
      handleEditEngs={handleEditEngs}
      isRepresentAll={isRepresentAll}
      probabilityCountSource={buildProbabilityCountSource(
        gho,
        viewData,
        headerWorkspaceId,
      )}
      planWorkspaceId={planWorkspaceId}
      readOnly={readOnly}
    />
  );
};
