import { buildEstablishmentSectorAggregates } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-sector';
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

export type { EstablishmentSectorGroup } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment-sector';

type Props = {
  rows: FormParticipantsBrowseResultModel[];
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

export const FormParticipantsGroupedByEstablishmentSector = ({
  rows,
  isLoading,
  fetchCap,
  isPartialFetch,
}: Props) => {
  const groups = useMemo(
    () => buildEstablishmentSectorAggregates(rows),
    [rows],
  );

  if (isLoading) {
    return (
      <Typography color="text.secondary" sx={{ py: 3 }}>
        Carregando agrupamento por estabelecimento e setor…
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
            <TableCell>Estabelecimento / Setor</TableCell>
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
            groups.map((est) => (
              <Fragment key={est.establishmentLabel}>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell>
                    <Typography fontWeight={700}>
                      {est.establishmentLabel}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{est.total}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{est.responded}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>{est.notResponded}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>
                      {formatPercent(est.responseRatePercent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ResponseRateBar percent={est.responseRatePercent} />
                  </TableCell>
                </TableRow>
                {est.sectors.map((sector) => (
                  <TableRow key={`${est.establishmentLabel}-${sector.sectorLabel}`}>
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
