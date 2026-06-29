import { FC } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import { IAcgihRiskCorrelationItem } from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

import {
  cardinalityColors,
  cardinalityLabels,
  decisionSourceColors,
  decisionSourceLabels,
  finalStatusColors,
  finalStatusExplanations,
  finalStatusLabels,
} from '../acgih-risk-correlation-labels';

type Props = {
  data: IAcgihRiskCorrelationItem[];
  isLoading?: boolean;
  onOpenDetail: (item: IAcgihRiskCorrelationItem) => void;
};

export const AcgihRiskCorrelationTable: FC<Props> = ({
  data,
  isLoading,
  onOpenDetail,
}) => {
  const tableData: ITableData<IAcgihRiskCorrelationItem>[] = [
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
            text={row.matrix ?? ''}
            fontSize={11}
            color="text.secondary"
            lineNumber={1}
          />
        </Box>
      ),
    },
    {
      column: 'minmax(120px, 0.8fr)',
      header: <STableHRow justify="center">Promoção</STableHRow>,
      row: (row) => (
        <Box
          display="flex"
          flexDirection="column"
          gap={0.25}
          alignItems="center"
          width="100%"
        >
          <Chip
            size="small"
            variant="outlined"
            color={row.promoted ? 'success' : 'default'}
            label={row.promoted ? 'Promovido' : 'Não promovido'}
            sx={{ cursor: 'default' }}
          />
          {row.alreadyLinked && (
            <Chip
              size="small"
              variant="outlined"
              color="primary"
              label="Já vinculado"
              sx={{ cursor: 'default' }}
            />
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(180px, 1fr)',
      header: <STableHRow justify="center">Status</STableHRow>,
      row: (row) => (
        <Box
          display="flex"
          flexDirection="column"
          gap={0.25}
          alignItems="center"
          width="100%"
        >
          <Tooltip title={finalStatusExplanations[row.finalStatus]}>
            <Chip
              size="small"
              color={finalStatusColors[row.finalStatus]}
              label={finalStatusLabels[row.finalStatus]}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
          {row.autoStatus !== row.finalStatus && (
            <Tooltip
              title={`Status automático antes do override: ${finalStatusLabels[row.autoStatus]}`}
            >
              <STextRow
                text={`auto: ${finalStatusLabels[row.autoStatus]}`}
                fontSize={10}
                color="text.secondary"
                lineNumber={1}
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      column: '130px',
      header: <STableHRow justify="center">Fonte</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Chip
            size="small"
            variant="outlined"
            color={decisionSourceColors[row.decisionSource]}
            label={decisionSourceLabels[row.decisionSource]}
            sx={{ cursor: 'default' }}
          />
        </Box>
      ),
    },
    {
      column: '120px',
      header: <STableHRow justify="center">Cardinalidade</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Chip
            size="small"
            variant="outlined"
            color={cardinalityColors[row.cardinality]}
            label={cardinalityLabels[row.cardinality]}
            sx={{ cursor: 'default' }}
          />
        </Box>
      ),
    },
    {
      column: 'minmax(200px, 1.4fr)',
      header: <STableHRow>Fator(es) de Risco</STableHRow>,
      row: (row) => {
        if (!row.links.length) {
          return <STextRow text="—" color="text.secondary" />;
        }
        return (
          <Box display="flex" flexDirection="column" gap={0.25}>
            {row.links.map((link) => (
              <STextRow
                key={link.riskFactorId}
                text={link.isGroup ? `${link.riskName} (grupo)` : link.riskName}
                fontSize={11}
                lineNumber={2}
              />
            ))}
          </Box>
        );
      },
    },
    {
      column: 'minmax(150px, 1fr)',
      header: <STableHRow>Bloqueios / Avisos</STableHRow>,
      row: (row) => {
        if (!row.blockers.length && !row.warnings.length) {
          return <STextRow text="—" color="text.secondary" />;
        }
        return (
          <Box display="flex" flexDirection="column" gap={0.25}>
            {row.blockers.map((code) => (
              <Tooltip key={code} title={code}>
                <Chip
                  size="small"
                  variant="outlined"
                  color="error"
                  label="Bloqueio"
                  sx={{
                    cursor: 'default',
                    justifyContent: 'flex-start',
                    height: 20,
                    '& .MuiChip-label': { px: 0.75, fontSize: 11 },
                  }}
                />
              </Tooltip>
            ))}
            {row.warnings.map((w) => (
              <Tooltip key={w} title={w}>
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label="Aviso"
                  sx={{
                    cursor: 'default',
                    justifyContent: 'flex-start',
                    height: 20,
                    '& .MuiChip-label': { px: 0.75, fontSize: 11 },
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
          <Tooltip title="Ver correlação completa (somente leitura)">
            <IconButton size="small" onClick={() => onOpenDetail(row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <STable
      isLoading={isLoading}
      table={tableData}
      data={data}
      renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
      renderBody={({ data: rowsData, rows }) => (
        <STableBody
          rows={rowsData}
          contentEmpty="Nenhum item ACGIH/BEI encontrado com os filtros atuais."
          renderRow={(row) => (
            <STableRow key={row.acgihBeiIndicatorId} minHeight={40}>
              {rows.map((render) => render(row))}
            </STableRow>
          )}
        />
      )}
    />
  );
};
