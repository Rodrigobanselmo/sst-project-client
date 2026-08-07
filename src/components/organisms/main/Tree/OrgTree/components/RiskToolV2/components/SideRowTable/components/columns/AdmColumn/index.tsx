import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { SelectedTableItem } from '../../SelectedTableItem';
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
  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.adms ?? [])
      .filter(
        (adm): adm is IRecMed =>
          !!adm && typeof adm.id === 'string' && !!adm.id && !!adm.medName,
      )
      .map((adm) => ({
        kind: 'adm' as const,
        sourceRiskId: risk?.id || '',
        name: adm.medName || '',
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
            multiple={false}
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
              const op = options as IRecMed;
              if (op.id)
                handleSelect(
                  {
                    adms: [op.id],
                  },
                  op,
                );
            }}
          />
          <RiskCatalogBatchCopyButton
            kind="adm"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {data &&
          (data.adms ?? [])
            .filter(
              (adm): adm is IRecMed =>
                !!adm && typeof adm.id === 'string' && !!adm.id,
            )
            .map((adm) => {
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
                    name: adm.medName || '',
                    catalogId: adm.id,
                    medType: adm.medType || MedTypeEnum.ADM,
                  }}
                  disabled={!risk?.id || !adm.medName}
                >
                  <SelectedTableItem
                    name={adm.medName || 'Medida administrativa'}
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
                  />
                </RiskCatalogDraggableItem>
              );
            })}
      </Box>
    </RiskCatalogDropColumn>
  );
};
