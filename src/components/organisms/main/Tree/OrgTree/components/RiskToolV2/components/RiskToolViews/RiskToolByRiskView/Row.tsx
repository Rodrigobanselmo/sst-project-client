import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { RiskEnum } from 'project/enum/risk.enums';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import {
  RiskCatalogDropLock,
  useRiskCatalogDndOptional,
} from '../../../risk-catalog-dnd/RiskCatalogDndProvider';
import { RiskCatalogRecordScope } from '../../../risk-catalog-dnd/RiskCatalogRecordScope';
import { RiskToolSingleRiskRow } from '../../SideRowTable/SingleRisk';
import { useRiskRowsExpandOptional } from '../RiskToolGSEView/RiskRowsExpandContext';
import { RiskToolGSEViewRowRiskBox } from '../RiskToolGSEView/Row/RiskBox';
import { RiskToolByRiskRow as RiskToolByRiskRowData } from './build-risk-tool-by-risk-rows.util';

type RiskToolByRiskRowProps = {
  row: RiskToolByRiskRowData;
  risk: IRiskFactors;
  riskGroupId: string;
};

export const RiskToolByRiskRow = React.memo<RiskToolByRiskRowProps>(
  ({ row, risk, riskGroupId }) => {
    const expandCtx = useRiskRowsExpandOptional();
    const dnd = useRiskCatalogDndOptional();
    const { riskData, readOnly } = row;

    const scope = useMemo(
      () => ({ riskData, label: row.ghoName }),
      [riskData, row.ghoName],
    );

    const isRepresentAll =
      risk.type === RiskEnum.OUTROS && !!risk.representAll;
    const expanded = expandCtx ? expandCtx.isExpanded(row.rowId) : false;
    const borderColor = row.isHistorical ? 'error.main' : 'grey.400';

    const isBatchSelecting = !!dnd?.isSelectingDestination && !readOnly;
    const isBatchSource =
      isBatchSelecting && dnd?.batchSession?.sourceRiskDataId === riskData.id;
    const isBatchDestination =
      isBatchSelecting &&
      dnd?.batchSession?.sourceRiskId === risk.id &&
      !!dnd?.batchSession?.sourceRiskDataId &&
      dnd.batchSession.sourceRiskDataId !== riskData.id;

    const columns = (
      <RiskCatalogRecordScope value={scope}>
        <RiskToolSingleRiskRow
          hide={false}
          riskGroupId={riskGroupId}
          risk={risk}
          riskData={riskData}
          isRepresentAll={isRepresentAll}
          readOnly={readOnly}
          targetGho={row.gho}
        />
      </RiskCatalogRecordScope>
    );

    return (
      <Box
        data-testid="risk-tool-by-risk-row"
        sx={{
          width: '100%',
          mb: 5,
          border: '1.5px solid',
          borderColor: isBatchDestination
            ? 'primary.main'
            : isBatchSource
              ? 'warning.main'
              : borderColor,
          borderRadius: 1,
          backgroundColor: isBatchDestination
            ? 'rgba(25, 118, 210, 0.04)'
            : 'background.paper',
          boxShadow: isBatchDestination
            ? '0 0 0 1px rgba(25, 118, 210, 0.25)'
            : undefined,
          transition:
            'border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
          flexShrink: 0,
          overflow: 'visible',
          cursor: isBatchDestination ? 'copy' : undefined,
        }}
      >
        <Box
          sx={{
            ...(isBatchDestination
              ? {
                  backgroundColor: 'rgba(25, 118, 210, 0.06)',
                  borderBottom: '1px solid',
                  borderColor: 'primary.light',
                }
              : {}),
            ...(isBatchSource
              ? { backgroundColor: 'rgba(237, 108, 2, 0.06)' }
              : {}),
          }}
        >
          <RiskToolGSEViewRowRiskBox
            riskData={riskData}
            data={risk}
            hide
            riskGroupId={riskGroupId}
            isRepresentAll={isRepresentAll}
            expanded={expanded}
            framed
            readOnly={readOnly}
            showOriginActions={false}
            headerTitle={row.ghoName}
            hideRiskAiButton
            onToggleExpand={
              expandCtx ? () => expandCtx.toggle(row.rowId) : undefined
            }
          />
        </Box>
        {expanded && (
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'visible',
              backgroundColor: isBatchDestination
                ? 'rgba(25, 118, 210, 0.03)'
                : 'background.paper',
            }}
          >
            {readOnly ? <RiskCatalogDropLock>{columns}</RiskCatalogDropLock> : columns}
          </Box>
        )}
      </Box>
    );
  },
);

RiskToolByRiskRow.displayName = 'RiskToolByRiskRow';
