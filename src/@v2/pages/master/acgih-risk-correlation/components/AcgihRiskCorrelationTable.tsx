import { FC } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import {
  IAcgihExamPreviewLink,
  IAcgihRiskCorrelationItem,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

import {
  cardinalityColors,
  cardinalityLabels,
  cardinalityTooltips,
  decisionSourceColors,
  decisionSourceLabels,
  decisionSourceTooltips,
  examLinkStatusColors,
  examLinkStatusLabels,
  examLinkStatusTooltips,
  finalStatusColors,
  finalStatusExplanations,
  finalStatusLabels,
  formatExamSuggestion,
  promotionTooltips,
} from '../acgih-risk-correlation-labels';

export type AcgihCorrelationTableRow = IAcgihRiskCorrelationItem & {
  officialIndicatorId?: string | null;
  examLink?: IAcgihExamPreviewLink;
};

const needsAmbiguousResolution = (examLink?: IAcgihExamPreviewLink): boolean =>
  examLink?.pendingReason === 'AMBIGUOUS_CANDIDATES' ||
  (examLink?.ambiguousCandidates?.length ?? 0) > 1 ||
  (examLink?.status === 'AMBIGUOUS' &&
    (examLink?.candidates?.length ?? 0) > 0);

type Props = {
  data: AcgihCorrelationTableRow[];
  isLoading?: boolean;
  onOpenDetail: (item: IAcgihRiskCorrelationItem) => void;
  onResolveAmbiguous?: (row: AcgihCorrelationTableRow) => void;
};

export const AcgihRiskCorrelationTable: FC<Props> = ({
  data,
  isLoading,
  onOpenDetail,
  onResolveAmbiguous,
}) => {
  const tableData: ITableData<AcgihCorrelationTableRow>[] = [
    {
      column: 'minmax(200px, 1.4fr)',
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
      column: 'minmax(110px, 0.7fr)',
      header: <STableHRow justify="center">Promoção</STableHRow>,
      row: (row) => (
        <Box
          display="flex"
          flexDirection="column"
          gap={0.25}
          alignItems="center"
          width="100%"
        >
          <Tooltip
            title={
              row.promoted
                ? promotionTooltips.promoted
                : promotionTooltips.notPromoted
            }
          >
            <Chip
              size="small"
              variant="outlined"
              color={row.promoted ? 'success' : 'default'}
              label={row.promoted ? 'Promovido' : 'Não promovido'}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      column: 'minmax(130px, 0.8fr)',
      header: <STableHRow justify="center">Vínculo risco</STableHRow>,
      row: (row) => {
        const riskNames = row.links.map((l) => l.riskName);
        return (
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
            {row.alreadyLinked && (
              <Tooltip
                title={promotionTooltips.alreadyLinkedRisk(riskNames)}
              >
                <Chip
                  size="small"
                  variant="outlined"
                  color="success"
                  label="Já vinculado"
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      column: 'minmax(120px, 0.75fr)',
      header: <STableHRow justify="center">Exame sistema</STableHRow>,
      row: (row) => {
        const status = row.examLink?.status ?? 'NO_MATCH';
        const tooltip =
          status === 'LINKED' && row.examLink?.examName
            ? `Exame confirmado: ${row.examLink.examName}`
            : status === 'LINKED_PENDING_CONFIRMATION' && row.examLink?.examName
              ? `Exame pendente de confirmação: ${row.examLink.examName}`
              : examLinkStatusTooltips[status];
        return (
          <Box display="flex" justifyContent="center" width="100%">
            <Tooltip title={tooltip}>
              <Chip
                size="small"
                variant="outlined"
                color={examLinkStatusColors[status]}
                label={examLinkStatusLabels[status]}
                sx={{ cursor: 'default' }}
              />
            </Tooltip>
          </Box>
        );
      },
    },
    {
      column: 'minmax(160px, 1fr)',
      header: <STableHRow>Sugestão vínculo</STableHRow>,
      row: (row) => {
        const suggestion = formatExamSuggestion(row.examLink);
        const candidates = row.examLink?.ambiguousCandidates ?? row.examLink?.candidates ?? [];
        const tooltip =
          candidates.length > 0
            ? `Candidatos: ${candidates.map((c) => c.examName).join('; ')}`
            : suggestion;
        return (
          <Tooltip title={tooltip}>
            <STextRow
              text={suggestion}
              fontSize={11}
              lineNumber={2}
              color={
                row.examLink?.status === 'AMBIGUOUS' ? 'warning.main' : undefined
              }
            />
          </Tooltip>
        );
      },
    },
    {
      column: '100px',
      header: <STableHRow justify="center">Fonte</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Tooltip title={decisionSourceTooltips[row.decisionSource]}>
            <Chip
              size="small"
              variant="outlined"
              color={decisionSourceColors[row.decisionSource]}
              label={decisionSourceLabels[row.decisionSource]}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      column: '100px',
      header: <STableHRow justify="center">Cardinalidade</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Tooltip title={cardinalityTooltips[row.cardinality]}>
            <Chip
              size="small"
              variant="outlined"
              color={cardinalityColors[row.cardinality]}
              label={cardinalityLabels[row.cardinality]}
              sx={{ cursor: 'default' }}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      column: 'minmax(180px, 1.2fr)',
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
      column: 'minmax(130px, 0.9fr)',
      header: <STableHRow>Bloqueios</STableHRow>,
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
      column: '110px',
      header: <STableHRow justify="center">Ações</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          {needsAmbiguousResolution(row.examLink) && onResolveAmbiguous && (
            <Tooltip title="Resolver ambiguidade de exame">
              <IconButton
                size="small"
                color="warning"
                onClick={() => onResolveAmbiguous(row)}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
