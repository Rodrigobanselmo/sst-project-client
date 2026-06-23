import {
  buildCombinedHierarchyNestedAggregates,
  type CombinedHierarchyGroupMetrics,
  type CombinedHierarchyNestedGroup,
} from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import type { CombinedHierarchyGroupingConfig } from '@v2/models/form/helpers/form-participants-combined-hierarchy-grouping.config';
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
  config: CombinedHierarchyGroupingConfig;
  isLoading: boolean;
  fetchCap: number;
  isPartialFetch: boolean;
};

function ResponseRateBar({ percent }: { percent: number }) {
  const barColor = getResponseRateBarColor(percent);
  const barWidth = Math.min(100, Math.max(0, percent));

  return (
    <LinearProgress
      variant="determinate"
      value={barWidth}
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

function MetricsCells({
  metrics,
  emphasized = false,
}: {
  metrics: CombinedHierarchyGroupMetrics;
  emphasized?: boolean;
}) {
  const typographyProps = emphasized
    ? { fontWeight: 700 as const }
    : undefined;

  return (
    <>
      <TableCell align="right">
        <Typography {...typographyProps}>{metrics.total}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography {...typographyProps}>{metrics.responded}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography {...typographyProps}>{metrics.notResponded}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography {...typographyProps}>
          {formatPercent(metrics.responseRatePercent)}
        </Typography>
      </TableCell>
      <TableCell>
        <ResponseRateBar percent={metrics.responseRatePercent} />
      </TableCell>
    </>
  );
}

function getGroupIndent(depth: number) {
  return 2 + depth * 3;
}

function getLeafIndent(parentDepth: number) {
  return 2 + (parentDepth + 1) * 3;
}

function renderNestedGroup(group: CombinedHierarchyNestedGroup) {
  const isTopLevel = group.depth === 0;

  return (
    <Fragment key={group.key}>
      <TableRow sx={isTopLevel ? { backgroundColor: 'action.hover' } : undefined}>
        <TableCell sx={{ pl: getGroupIndent(group.depth) }}>
          <Typography
            fontWeight={isTopLevel ? 700 : 600}
            variant={isTopLevel ? 'body1' : 'body2'}
          >
            {group.label}
          </Typography>
        </TableCell>
        <MetricsCells metrics={group} emphasized={isTopLevel} />
      </TableRow>

      {group.subgroups.map((subgroup) => renderNestedGroup(subgroup))}

      {group.leaves.map((leaf) => (
        <TableRow key={`${group.key}>>${leaf.label}`}>
          <TableCell sx={{ pl: getLeafIndent(group.depth) }}>
            <Typography variant="body2" color="text.secondary">
              {leaf.label}
            </Typography>
          </TableCell>
          <MetricsCells metrics={leaf} />
        </TableRow>
      ))}
    </Fragment>
  );
}

export const FormParticipantsGroupedByCombinedHierarchy = ({
  rows,
  config,
  isLoading,
  fetchCap,
  isPartialFetch,
}: Props) => {
  const groups = useMemo(
    () => buildCombinedHierarchyNestedAggregates(rows, config.levels),
    [rows, config.levels],
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
            <TableCell>{config.columnLabel}</TableCell>
            <TableCell align="right">Participantes</TableCell>
            <TableCell align="right">Responderam</TableCell>
            <TableCell align="right">Não responderam</TableCell>
            <TableCell align="right">Taxa</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Resposta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary" variant="body2">
                  Nenhum participante no recorte.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => renderNestedGroup(group))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
