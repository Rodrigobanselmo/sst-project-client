import {
  buildSectorWithHierarchyGroupAggregates,
  type HierarchyGroupForParticipants,
} from '@v2/models/form/helpers/form-participants-aggregate-by-hierarchy-group';
import type { HierarchyGroupGroupingConfig } from '@v2/models/form/helpers/form-participants-hierarchy-grouping.config';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import {
  Alert,
  Box,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Fragment, useMemo } from 'react';

type Props = {
  rows: FormParticipantsBrowseResultModel[];
  hierarchyGroups: HierarchyGroupForParticipants[];
  config: HierarchyGroupGroupingConfig;
  isLoading: boolean;
  fetchCap: number;
  isPartialFetch: boolean;
};

function ResponseRateBar({ percent }: { percent: number }) {
  const barColor = getResponseRateBarColor(percent);
  const barW = Math.min(100, Math.max(0, percent));

  return (
    <LinearProgress
      variant="determinate"
      value={barW}
      sx={{
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
        '& .MuiLinearProgress-bar': {
          backgroundColor: barColor,
          borderRadius: 6,
        },
      }}
    />
  );
}

function formatPercent(value: number) {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })}%`;
}

export const FormParticipantsGroupedBySectorWithHierarchyGroup = ({
  rows,
  hierarchyGroups,
  config,
  isLoading,
  fetchCap,
  isPartialFetch,
}: Props) => {
  const blocks = useMemo(
    () => buildSectorWithHierarchyGroupAggregates(rows, hierarchyGroups),
    [rows, hierarchyGroups],
  );

  if (isLoading) {
    return (
      <Typography color="text.secondary" sx={{ py: 3 }}>
        {config.loadingMessage}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {isPartialFetch ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          O recorte tem mais de {fetchCap} participantes. O agrupamento usa apenas
          os primeiros {fetchCap} registros carregados; os totais podem estar
          incompletos. O resumo do topo continua refletindo o recorte completo.
        </Alert>
      ) : null}

      <Table component={Paper} size="small" variant="outlined">
        <TableHead>
          <TableRow>
            <TableCell>{config.nestedHeaderColumnLabel}</TableCell>
            <TableCell align="right">Participantes</TableCell>
            <TableCell align="right">Responderam</TableCell>
            <TableCell align="right">Não responderam</TableCell>
            <TableCell align="right">Taxa</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Resposta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blocks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary" variant="body2">
                  Nenhum participante no recorte.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            blocks.map((block) => (
              <Fragment key={block.groupId ?? block.groupLabel}>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>
                    <Typography fontWeight={700}>{block.groupLabel}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{block.total}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{block.responded}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{block.notResponded}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>
                      {formatPercent(block.responseRatePercent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ResponseRateBar percent={block.responseRatePercent} />
                  </TableCell>
                </TableRow>
                {block.sectors.map((sector) => (
                  <TableRow
                    key={`${block.groupLabel}-${sector.sectorLabel}`}
                  >
                    <TableCell sx={{ pl: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {sector.sectorLabel}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{sector.total}</TableCell>
                    <TableCell align="right">{sector.responded}</TableCell>
                    <TableCell align="right">{sector.notResponded}</TableCell>
                    <TableCell align="right">
                      {formatPercent(sector.responseRatePercent)}
                    </TableCell>
                    <TableCell>
                      <ResponseRateBar percent={sector.responseRatePercent} />
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
