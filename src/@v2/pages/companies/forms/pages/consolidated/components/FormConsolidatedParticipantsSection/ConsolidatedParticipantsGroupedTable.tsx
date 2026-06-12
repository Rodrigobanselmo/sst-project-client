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

import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL,
  ConsolidatedParticipantsAggregateRow,
} from '@v2/models/enterprise/company-group/consolidated-view-participants.helpers';

type Props = {
  title: string;
  labelColumn: string;
  aggregates: ConsolidatedParticipantsAggregateRow[];
};

export function ConsolidatedParticipantsGroupedTable({
  title,
  labelColumn,
  aggregates,
}: Props) {
  const protectedCount = aggregates.filter((row) => row.isProtected).length;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} mb={1}>
        {title}
      </Typography>

      {protectedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {protectedCount} grupo(s) com menos de 3 participantes exibem apenas
          &quot;{CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL}&quot; para preservar
          o sigilo.
        </Alert>
      )}

      <Table component={Paper} size="small" variant="outlined">
        <TableHead>
          <TableRow>
            <TableCell>{labelColumn}</TableCell>
            <TableCell align="right">Participantes</TableCell>
            <TableCell align="right">Responderam</TableCell>
            <TableCell align="right">Não responderam</TableCell>
            <TableCell align="right">Taxa</TableCell>
            <TableCell sx={{ minWidth: 180 }}>Resposta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary" variant="body2">
                  Nenhum participante no recorte.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            aggregates.map((group) => {
              if (group.isProtected) {
                return (
                  <TableRow key={group.groupKey}>
                    <TableCell colSpan={6}>
                      <Typography fontWeight={600} color="text.secondary">
                        🔒 {CONSOLIDATED_PARTICIPANTS_PROTECTED_LABEL}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              }

              const barColor = getResponseRateBarColor(group.responseRatePercent);
              const barWidth = Math.min(
                100,
                Math.max(0, group.responseRatePercent),
              );

              return (
                <TableRow key={group.groupKey}>
                  <TableCell>
                    <Typography fontWeight={600}>{group.groupLabel}</Typography>
                  </TableCell>
                  <TableCell align="right">{group.total}</TableCell>
                  <TableCell align="right">{group.responded}</TableCell>
                  <TableCell align="right">{group.notResponded}</TableCell>
                  <TableCell align="right">
                    {group.responseRatePercent.toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
