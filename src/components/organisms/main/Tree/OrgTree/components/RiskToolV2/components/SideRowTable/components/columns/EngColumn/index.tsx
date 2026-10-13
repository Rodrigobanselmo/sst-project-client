import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';

import { IdsEnum } from 'core/enums/ids.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { ControlCorrespondenceRowAction } from '../../../../ExistingControlCorrespondenceAction';

import { RiskCatalogBulkAddButton } from '../../../../../risk-catalog-bulk-add/RiskCatalogBulkAddButton';
import { resolveNewCatalogIds } from '../../../../../risk-catalog-bulk-add/resolve-risk-catalog-multi-select.util';
import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { catalogControlDisplayName } from '../../../../../catalog-control-display-name.util';
import { filterImplementedControls } from '../../../../../utils/derived-control-scope.util';
import { openFactorLinkedControlIds } from '../../../../../utils/existing-control-correspondence.util';
import { SelectedTableItem } from '../../SelectedTableItem';
import { RiskFactorFieldAiButton } from '../../../../../risk-factors-ai/RiskFactorAiButton';
import { RiskFactorAiPendingList } from '../../../../../risk-factors-ai/RiskFactorAiPendingList';
import { EngColumnProps } from './types';
import {
  getCharacterizationPlanItemTintSx,
  getDerivedMeasurePlanStatus,
  getDerivedMeasureTooltipPlanStatus,
} from '../../../../../utils/characterization-action-plan-visual';

export const EngColumn: FC<{ children?: any } & EngColumnProps> = ({
  handleSelect,
  handleRemove,
  handleEdit,
  data,
  risk,
  planWorkspaceId,
  readOnly,
}) => {
  const { companyId } = useGetCompanyId();
  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.engs ?? [])
      .filter(
        (eng): eng is IRecMed =>
          !!eng &&
          typeof eng.id === 'string' &&
          !!eng.id &&
          !!catalogControlDisplayName(eng, 'measure'),
      )
      .map((eng) => ({
        kind: 'eng' as const,
        sourceRiskId: risk?.id || '',
        name: catalogControlDisplayName(eng, 'measure'),
        catalogId: eng.id,
        medType: eng.medType || MedTypeEnum.ENG,
      }));
  }, [data?.engs, risk?.id]);

  return (
    <RiskCatalogDropColumn
      kind="eng"
      risk={risk}
      riskData={data as IRiskData}
      handleSelect={handleSelect}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedSelect
            disabled={!risk?.id}
            text={'adicionar'}
            onlyInput="eng"
            onlyFromActualRisks
            tooltipTitle=""
            multiple
            confirmSelectionOnClose={false}
            lockSelected
            selectedMed={(data?.engs ?? [])
              .map((eng) => eng?.id)
              .filter((id): id is string => typeof id === 'string' && !!id)}
            existingControlLinkedIds={openFactorLinkedControlIds(data?.recs)}
            factorRecs={data?.recs}
            factorDataRecs={data?.dataRecs}
            factorDerivedMeasures={data?.riskFactorDataRecDerivedMeasures}
            planWorkspaceId={planWorkspaceId}
            riskIds={[risk?.id || '']}
            risk={risk ? risk : undefined}
            type={MedTypeEnum.ENG}
            onCreate={(engs) => {
              if (engs && engs.id && engs.medType === MedTypeEnum.ENG)
                handleSelect(
                  {
                    engs: [{ ...engs?.engsRiskData, recMedId: engs.id }],
                  },
                  engs,
                );

              document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
            }}
            handleSelect={(options) => {
              const ids = resolveNewCatalogIds(
                options,
                (data?.engs ?? []).map((eng) => eng?.id),
              );
              if (!ids.length) return;
              handleSelect({
                engs: ids.map((recMedId) => ({ recMedId })),
              });
            }}
          />
          <RiskFactorFieldAiButton
            riskId={risk?.id}
            riskName={risk?.name}
            field="existingEngineeringMeasures"
          />
          <RiskCatalogBulkAddButton
            kind="eng"
            risk={risk}
            riskData={data as IRiskData}
            handleSelect={handleSelect}
          />
          <RiskCatalogBatchCopyButton
            kind="eng"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {data &&
          filterImplementedControls({
            controls: data.engs ?? [],
            getId: (eng) => eng?.id,
            derivedLinks: data.riskFactorDataRecDerivedMeasures,
            workspaceId: planWorkspaceId,
          })
            .filter(
              (eng): eng is IRecMed =>
                !!eng && typeof eng.id === 'string' && !!eng.id,
            )
            .map((eng) => {
              const measureName = catalogControlDisplayName(eng, 'measure');
              const planStatus = getDerivedMeasurePlanStatus(
                data as IRiskData,
                eng.id,
                planWorkspaceId,
              );
              const planTooltipStatus = getDerivedMeasureTooltipPlanStatus(
                data as IRiskData,
                eng.id,
                planWorkspaceId,
              );
              return (
                <RiskCatalogDraggableItem
                  key={eng.id}
                  item={{
                    kind: 'eng',
                    sourceRiskId: risk?.id || '',
                    name: measureName,
                    catalogId: eng.id,
                    medType: eng.medType || MedTypeEnum.ENG,
                  }}
                  disabled={!risk?.id || !measureName}
                >
                  <SelectedTableItem
                    name={measureName}
                    recType={
                      eng.medType === MedTypeEnum.ADM ||
                      eng.medType === MedTypeEnum.ENG
                        ? eng.medType
                        : undefined
                    }
                    planStatus={planStatus}
                    planTooltipStatus={planTooltipStatus}
                    itemTintSx={getCharacterizationPlanItemTintSx(
                      planTooltipStatus ?? planStatus,
                    )}
                    handleEdit={() =>
                      !isNaRecMed(eng.medName) && handleEdit(eng)
                    }
                    handleRemove={() =>
                      handleRemove({
                        engs: [eng.engsRiskData || eng],
                      })
                    }
                    trailingAction={
                      <ControlCorrespondenceRowAction
                        kind="eng"
                        control={eng}
                        recs={data?.recs}
                        dataRecs={data?.dataRecs}
                        derivedMeasures={
                          data?.riskFactorDataRecDerivedMeasures
                        }
                        workspaceId={planWorkspaceId}
                        companyId={companyId}
                        onLink={handleSelect}
                        onUndo={handleRemove}
                      />
                    }
                  />
                </RiskCatalogDraggableItem>
              );
            })}
        <RiskFactorAiPendingList
          column="eng"
          riskId={risk?.id}
          riskData={data}
          handleSelect={handleSelect}
          readOnly={readOnly}
        />
      </Box>
    </RiskCatalogDropColumn>
  );
};
