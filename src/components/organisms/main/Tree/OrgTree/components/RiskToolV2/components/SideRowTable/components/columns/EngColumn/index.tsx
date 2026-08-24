import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { RiskCatalogBulkAddButton } from '../../../../../risk-catalog-bulk-add/RiskCatalogBulkAddButton';
import { resolveNewCatalogIds } from '../../../../../risk-catalog-bulk-add/resolve-risk-catalog-multi-select.util';
import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { SelectedTableItem } from '../../SelectedTableItem';
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
}) => {
  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.engs ?? [])
      .filter(
        (eng): eng is IRecMed =>
          !!eng && typeof eng.id === 'string' && !!eng.id && !!eng.medName,
      )
      .map((eng) => ({
        kind: 'eng' as const,
        sourceRiskId: risk?.id || '',
        name: eng.medName || '',
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
          (data.engs ?? [])
            .filter(
              (eng): eng is IRecMed =>
                !!eng && typeof eng.id === 'string' && !!eng.id,
            )
            .map((eng) => {
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
                    name: eng.medName || '',
                    catalogId: eng.id,
                    medType: eng.medType || MedTypeEnum.ENG,
                  }}
                  disabled={!risk?.id || !eng.medName}
                >
                  <SelectedTableItem
                    name={eng.medName || 'Medida de engenharia'}
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
                  />
                </RiskCatalogDraggableItem>
              );
            })}
      </Box>
    </RiskCatalogDropColumn>
  );
};
