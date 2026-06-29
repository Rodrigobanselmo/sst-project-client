import { FC } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import { IAcgihPromotionPreviewItem } from '@v2/services/medicine/acgih-promotion-preview/service/acgih-promotion-preview.types';

import {
  duplicateRiskColors,
  duplicateRiskLabels,
  eligibilityStatusColors,
  eligibilityStatusLabels,
  eligibilityStatusExplanations,
  formatBlocker,
  formatCollectionMoment,
  momentConfidenceColors,
  momentConfidenceLabels,
  tierColors,
  tierExplanations,
  tierLabels,
} from '../acgih-promotion-preview-labels';

type Props = {
  data: IAcgihPromotionPreviewItem[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onOpenDetail: (item: IAcgihPromotionPreviewItem) => void;
};

export const AcgihPromotionPreviewTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onOpenDetail,
}) => {
  const tableData: ITableData<IAcgihPromotionPreviewItem>[] = [
    {
      column: 'minmax(220px, 1.6fr)',
      header: <STableHRow>ACGIH/BEI</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column">
          <STextRow text={row.substanceName} lineNumber={2} />
          <STextRow
            text={[row.cas ? `CAS ${row.cas}` : null, row.determinant]
              .filter(Boolean)
              .join(' · ')}
            fontSize={11}
            color="text.secondary"
            lineNumber={2}
          />
          <STextRow
            text={[
              row.biologicalMatrix,
              row.referenceValue
                ? `${row.referenceValue}${row.unit ? ` ${row.unit}` : ''}`
                : null,
              row.notation ? `notação ${row.notation}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            fontSize={11}
            color="text.secondary"
            lineNumber={2}
          />
        </Box>
      ),
    },
    {
      column: 'minmax(170px, 1fr)',
      header: <STableHRow>Momento de coleta</STableHRow>,
      row: (row) => {
        const moment = row.mappedFields.collectionMoment;
        return (
          <Box display="flex" flexDirection="column" gap={0.25}>
            <STextRow
              text={moment.original ?? '—'}
              fontSize={11}
              color="text.secondary"
              lineNumber={2}
            />
            <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                color={momentConfidenceColors[moment.confidence]}
                label={
                  moment.mappedValue
                    ? `${formatCollectionMoment(moment.mappedValue)} · ${momentConfidenceLabels[moment.confidence]}`
                    : momentConfidenceLabels[moment.confidence]
                }
                sx={{ cursor: 'default' }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      column: '150px',
      header: <STableHRow justify="center">Tier</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Tooltip title={tierExplanations[row.eligibilityTier]}>
            <Chip
              size="small"
              variant="outlined"
              color={tierColors[row.eligibilityTier]}
              label={tierLabels[row.eligibilityTier]}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      column: '150px',
      header: <STableHRow justify="center">Elegibilidade</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Tooltip title={eligibilityStatusExplanations[row.eligibilityStatus]}>
            <Chip
              size="small"
              color={eligibilityStatusColors[row.eligibilityStatus]}
              label={eligibilityStatusLabels[row.eligibilityStatus]}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      column: 'minmax(140px, 0.9fr)',
      header: <STableHRow justify="center">Duplicidade</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Chip
            size="small"
            variant="outlined"
            color={duplicateRiskColors[row.duplicateRisk]}
            label={duplicateRiskLabels[row.duplicateRisk]}
            sx={{ cursor: 'default' }}
          />
        </Box>
      ),
    },
    {
      column: 'minmax(180px, 1.2fr)',
      header: <STableHRow>Bloqueios / Avisos</STableHRow>,
      row: (row) => {
        if (!row.blockers.length && !row.warnings.length) {
          return <STextRow text="—" color="text.secondary" />;
        }
        return (
          <Box display="flex" flexDirection="column" gap={0.25}>
            {row.blockers.map((code) => (
              <Chip
                key={code}
                size="small"
                variant="outlined"
                color="error"
                label={formatBlocker(code)}
                sx={{
                  cursor: 'default',
                  justifyContent: 'flex-start',
                  height: 20,
                  '& .MuiChip-label': { px: 0.75, fontSize: 11 },
                }}
              />
            ))}
            {row.warnings.map((w) => (
              <Tooltip key={w} title={w}>
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label={w}
                  sx={{
                    cursor: 'default',
                    justifyContent: 'flex-start',
                    height: 20,
                    maxWidth: 240,
                    '& .MuiChip-label': {
                      px: 0.75,
                      fontSize: 11,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        );
      },
    },
    {
      column: '90px',
      header: <STableHRow justify="center">Detalhe</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Tooltip title="Ver payload proposto e snapshot (somente leitura)">
            <IconButton size="small" onClick={() => onOpenDetail(row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <>
      <STable
        isLoading={isLoading}
        table={tableData}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data: rowsData, rows }) => (
          <STableBody
            rows={rowsData}
            contentEmpty="Nenhum candidato ACGIH/BEI elegível encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.acgihBeiIndicatorId} minHeight={40}>
                {rows.map((render) => render(row))}
              </STableRow>
            )}
          />
        )}
      />
      <STablePagination
        isLoading={isLoading}
        total={pagination.total}
        limit={pagination.limit}
        page={pagination.page}
        setPage={setPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};
