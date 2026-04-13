import { buildSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-sector';
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
import { useMemo } from 'react';

export type { SectorAggregateRow } from '@v2/models/form/helpers/form-participants-aggregate-by-sector';

type Props = {
  rows: FormParticipantsBrowseResultModel[];
  isLoading: boolean;
  fetchCap: number;
  isPartialFetch: boolean;
};

export const FormParticipantsGroupedBySector = ({
  rows,
  isLoading,
  fetchCap,
  isPartialFetch,
}: Props) => {
  const aggregates = useMemo(() => buildSectorAggregates(rows), [rows]);

  if (isLoading) {
    return (
      <Typography color="text.secondary" sx={{ py: 3 }}>
        Carregando agrupamento por setor…
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {isPartialFetch ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          O recorte tem mais de {fetchCap} participantes. O agrupamento usa apenas
          os primeiros {fetchCap} registros carregados; os totais por setor podem
          estar incompletos. O resumo do topo continua refletindo o recorte
          completo.
        </Alert>
      ) : null}

      <Table component={Paper} size="small" variant="outlined">
        <TableHead>
          <TableRow>
            <TableCell>Setor</TableCell>
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
            aggregates.map((g) => {
              const barColor = getResponseRateBarColor(g.responseRatePercent);
              const barW = Math.min(100, Math.max(0, g.responseRatePercent));
              return (
                <TableRow key={g.sectorLabel}>
                  <TableCell>
                    <Typography fontWeight={600}>{g.sectorLabel}</Typography>
                  </TableCell>
                  <TableCell align="right">{g.total}</TableCell>
                  <TableCell align="right">{g.responded}</TableCell>
                  <TableCell align="right">{g.notResponded}</TableCell>
                  <TableCell align="right">
                    {g.responseRatePercent.toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
};
