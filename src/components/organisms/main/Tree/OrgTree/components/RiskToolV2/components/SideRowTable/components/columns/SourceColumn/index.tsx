import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import { GenerateSourceSelect } from 'components/organisms/tagSelects/GenerateSourceSelect';

import { IdsEnum } from 'core/enums/ids.enums';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';

import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { SelectedTableItem } from '../../SelectedTableItem';
import { SourceColumnProps } from './types';

export const SourceColumn: FC<{ children?: any } & SourceColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.generateSources ?? [])
      .filter((gs) => !!gs && typeof gs.id === 'string' && !!gs.id && !!gs.name)
      .map((gs) => ({
        kind: 'generateSource' as const,
        sourceRiskId: risk?.id || '',
        name: gs.name || '',
        catalogId: gs.id,
      }));
  }, [data?.generateSources, risk?.id]);

  return (
    <RiskCatalogDropColumn
      kind="generateSource"
      risk={risk}
      riskData={data}
      handleSelect={handleSelect}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GenerateSourceSelect
            disabled={!risk?.id}
            onlyFromActualRisks
            text={'adicionar'}
            tooltipTitle=""
            multiple={false}
            riskIds={[risk?.id || '']}
            risk={risk ? risk : undefined}
            onCreate={(generateSource) => {
              if (generateSource && generateSource.id)
                handleSelect(
                  {
                    generateSources: [generateSource.id],
                  },
                  generateSource,
                );

              document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
            }}
            handleSelect={(options) => {
              const generateSource = options as IGenerateSource;
              if (generateSource.id)
                handleSelect(
                  {
                    generateSources: [generateSource.id],
                  },
                  generateSource,
                );
            }}
          />
          <RiskCatalogBatchCopyButton
            kind="generateSource"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {data &&
          (data.generateSources ?? [])
            .filter((gs) => !!gs && typeof gs.id === 'string' && !!gs.id)
            .map((gs) => (
              <RiskCatalogDraggableItem
                key={gs.id}
                item={{
                  kind: 'generateSource',
                  sourceRiskId: risk?.id || '',
                  name: gs.name || '',
                  catalogId: gs.id,
                }}
                disabled={!risk?.id || !gs.name}
              >
                <SelectedTableItem
                  name={gs.name || 'Fonte geradora'}
                  handleRemove={() =>
                    handleRemove({
                      generateSources: [gs.id],
                    })
                  }
                />
              </RiskCatalogDraggableItem>
            ))}
      </Box>
    </RiskCatalogDropColumn>
  );
};
