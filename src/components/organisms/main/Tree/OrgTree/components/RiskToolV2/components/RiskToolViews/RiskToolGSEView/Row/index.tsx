/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { RiskEnum } from 'project/enum/risk.enums';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { RiskToolSingleRiskRow } from '../../../SideRowTable/SingleRisk';
import { useRiskRowsExpandOptional } from '../RiskRowsExpandContext';
import { RiskToolGSEViewRowRiskBox } from './RiskBox';
import { SideRowProps } from './types';

// STBoxStack é flex column com altura fixa. overflow≠visible no filho zera
// min-height automático → flex-shrink esmaga o corpo. Ver flexShrink:0 abaixo.
export const RiskToolGSEViewRow = React.memo<SideRowProps>(
  ({ risk, riskData, riskGroupId }) => {
    const searchSelected = useAppSelector((state) => state?.gho.searchRisk);
    const expandCtx = useRiskRowsExpandOptional();

    const rowId = useMemo(
      () => String(riskData?.id || risk?.id || riskData?.riskId || ''),
      [risk?.id, riskData?.id, riskData?.riskId],
    );

    if (!risk?.id) return null;

    const isRepresentAll =
      risk.type === RiskEnum.OUTROS && !!risk.representAll;

    const isToFilter =
      !!searchSelected &&
      !stringNormalize(risk.name ?? '').includes(
        stringNormalize(searchSelected),
      );

    const expanded = expandCtx ? expandCtx.isExpanded(rowId) : false;
    const borderColor = riskData?.endDate ? 'error.main' : 'grey.400';

    return (
      <Box
        key={risk.id}
        sx={{
          display: isToFilter ? 'none' : 'block',
          width: '100%',
          mb: 5,
          border: '1.5px solid',
          borderColor,
          borderRadius: 1,
          backgroundColor: 'background.paper',
          // Crítico: não deixar o flex pai (STBoxStack) esmagar esta linha.
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <RiskToolGSEViewRowRiskBox
          riskData={riskData}
          data={risk}
          hide={false}
          riskGroupId={riskGroupId}
          isRepresentAll={isRepresentAll}
          expanded={expanded}
          framed
          onToggleExpand={
            expandCtx && rowId
              ? () => expandCtx.toggle(rowId)
              : undefined
          }
        />
        {expanded && (
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'visible',
              backgroundColor: 'background.paper',
            }}
          >
            <RiskToolSingleRiskRow
              hide={false}
              riskGroupId={riskGroupId}
              risk={risk}
              riskData={riskData}
              isRepresentAll={isRepresentAll}
            />
          </Box>
        )}
      </Box>
    );
  },
);
