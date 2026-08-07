import React, { FC, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { EpiCaDetailModal } from 'components/molecules/EpiCaDetail';
import { EpiSelect } from 'components/organisms/tagSelects/EpiSelect';
import dayjs from 'dayjs';
import { isNaEpi } from 'project/utils/isNa';

import { IEpi } from 'core/interfaces/api/IEpi';

import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';

export const EpiColumn: FC<{ children?: any } & EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  handleEdit,
  risk,
}) => {
  const [detailEpi, setDetailEpi] = useState<IEpi | null>(null);

  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.epis ?? [])
      .filter((epi) => !!epi && !!epi.ca && !isNaEpi(epi.ca))
      .map((epi) => ({
        kind: 'epi' as const,
        sourceRiskId: risk?.id || '',
        name: `CA: ${epi.ca}`,
        catalogId: epi.id,
        ca: String(epi.ca),
      }));
  }, [data?.epis, risk?.id]);

  return (
    <RiskCatalogDropColumn
      kind="epi"
      risk={risk}
      riskData={data}
      handleSelect={handleSelect}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EpiSelect
            asyncLoad
            disabled={!risk?.id}
            text={'adicionar'}
            tooltipTitle=""
            multiple={false}
            handleSelect={(options: IEpi) => {
              if (options.id)
                handleSelect(
                  {
                    epis: [{ ...options?.epiRiskData, epiId: options.id }],
                  },
                  options,
                );
            }}
          />
          <RiskCatalogBatchCopyButton
            kind="epi"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {data &&
          (data.epis ?? [])
            .filter((epi) => !!epi && (!!epi.id || !!epi.ca || !!epi.equipment))
            .map((epi) => {
              const isExpired = dayjs(epi.expiredDate).isBefore(dayjs());
              const isNa = isNaEpi(epi.ca);
              return (
                <RiskCatalogDraggableItem
                  key={epi.id || epi.ca || epi.equipment}
                  item={{
                    kind: 'epi',
                    sourceRiskId: risk?.id || '',
                    name: isNa
                      ? epi.equipment || 'EPI'
                      : `CA: ${epi.ca}`,
                    catalogId: epi.id,
                    ca: epi.ca ? String(epi.ca) : undefined,
                  }}
                  disabled={!risk?.id || isNa}
                >
                  <SelectedTableItem
                    isExpired={isExpired}
                    handleEdit={() => !isNa && handleEdit(epi)}
                    handleInfo={isNa ? undefined : () => setDetailEpi(epi)}
                    infoTooltip="Ver detalhe completo do CA"
                    name={isNa ? `${epi.equipment || 'EPI'}` : `CA: ${epi.ca}`}
                    tooltip={
                      isNa
                        ? ''
                        : `CA ${epi.ca} - validade:(${dayjs(
                            epi.expiredDate,
                          ).format('DD/MM/YYYY')}) - ${epi.equipment}`
                    }
                    handleRemove={() =>
                      handleRemove({
                        epis: [epi.epiRiskData || epi],
                      })
                    }
                  />
                </RiskCatalogDraggableItem>
              );
            })}
        <EpiCaDetailModal
          epi={detailEpi}
          open={!!detailEpi}
          onClose={() => setDetailEpi(null)}
        />
      </Box>
    </RiskCatalogDropColumn>
  );
};
