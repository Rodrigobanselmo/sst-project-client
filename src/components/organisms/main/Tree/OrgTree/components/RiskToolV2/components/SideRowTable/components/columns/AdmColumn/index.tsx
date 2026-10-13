import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';

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
import { AdmColumnProps } from './types';
import {
  getCharacterizationPlanItemTintSx,
  getDerivedMeasurePlanStatus,
  getDerivedMeasureTooltipPlanStatus,
} from '../../../../../utils/characterization-action-plan-visual';

export const AdmColumn: FC<{ children?: any } & AdmColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
  planWorkspaceId,
}) => {
  const { companyId } = useGetCompanyId();
  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.adms ?? [])
      .filter(
        (adm): adm is IRecMed =>
          !!adm &&
          typeof adm.id === 'string' &&
          !!adm.id &&
          !!catalogControlDisplayName(adm, 'measure'),
      )
      .map((adm) => ({
        kind: 'adm' as const,
        sourceRiskId: risk?.id || '',
        name: catalogControlDisplayName(adm, 'measure'),
        catalogId: adm.id,
        medType: adm.medType || MedTypeEnum.ADM,
      }));
  }, [data?.adms, risk?.id]);

  return (
    <RiskCatalogDropColumn
      kind="adm"
      risk={risk}
      riskData={data as IRiskData}
      handleSelect={handleSelect}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedSelect
            disabled={!risk?.id}
            onlyFromActualRisks
            text={'adicionar'}
            tooltipTitle=""
            multiple
            confirmSelectionOnClose={false}
            lockSelected
            selectedMed={(data?.adms ?? [])
              .map((adm) => adm?.id)
              .filter((id): id is string => typeof id === 'string' && !!id)}
            existingControlLinkedIds={openFactorLinkedControlIds(data?.recs)}
            factorRecs={data?.recs}
            factorDataRecs={data?.dataRecs}
            factorDerivedMeasures={data?.riskFactorDataRecDerivedMeasures}
            planWorkspaceId={planWorkspaceId}
            riskIds={[risk?.id || '']}
            risk={risk ? risk : undefined}
            type={MedTypeEnum.ADM}
            onlyInput="adm"
            onCreate={(adm) => {
              if (adm && adm.id && adm.medType === MedTypeEnum.ADM)
                handleSelect(
                  {
                    adms: [adm.id],
                  },
                  adm,
                );

              document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
            }}
            handleSelect={(options) => {
              const ids = resolveNewCatalogIds(
                options,
                (data?.adms ?? []).map((adm) => adm?.id),
              );
              if (!ids.length) return;
              handleSelect({ adms: ids });
            }}
          />
          <RiskFactorFieldAiButton
            riskId={risk?.id}
            riskName={risk?.name}
            field="existingAdministrativeMeasures"
          />
          <RiskCatalogBulkAddButton
            kind="adm"
            risk={risk}
            riskData={data as IRiskData}
            handleSelect={handleSelect}
          />
          <RiskCatalogBatchCopyButton
            kind="adm"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {data &&
          filterImplementedControls({
            controls: data.adms ?? [],
            getId: (adm) => adm?.id,
            derivedLinks: data.riskFactorDataRecDerivedMeasures,
            workspaceId: planWorkspaceId,
          })
            .filter(
              (adm): adm is IRecMed =>
                !!adm && typeof adm.id === 'string' && !!adm.id,
            )
            .map((adm) => {
              const measureName = catalogControlDisplayName(adm, 'measure');
              const planStatus = getDerivedMeasurePlanStatus(
                data as IRiskData,
                adm.id,
                planWorkspaceId,
              );
              const planTooltipStatus = getDerivedMeasureTooltipPlanStatus(
                data as IRiskData,
                adm.id,
                planWorkspaceId,
              );
              return (
                <RiskCatalogDraggableItem
                  key={adm.id}
                  item={{
                    kind: 'adm',
                    sourceRiskId: risk?.id || '',
                    name: measureName,
                    catalogId: adm.id,
                    medType: adm.medType || MedTypeEnum.ADM,
                  }}
                  disabled={!risk?.id || !measureName}
                >
                  <SelectedTableItem
                    name={measureName}
                    recType={
                      adm.medType === MedTypeEnum.ADM ||
                      adm.medType === MedTypeEnum.ENG
                        ? adm.medType
                        : undefined
                    }
                    planStatus={planStatus}
                    planTooltipStatus={planTooltipStatus}
                    itemTintSx={getCharacterizationPlanItemTintSx(
                      planTooltipStatus ?? planStatus,
                    )}
                    handleRemove={() =>
                      handleRemove({
                        adms: [adm.id],
                      })
                    }
                    trailingAction={
                      <ControlCorrespondenceRowAction
                        kind="adm"
                        control={adm}
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
      </Box>
    </RiskCatalogDropColumn>
  );
};
