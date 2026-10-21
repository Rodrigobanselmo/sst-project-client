import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from 'react-query';
import {
  AdministrationApi,
  adminQueryKey,
  statusLabels,
} from './illustration-administration.api';

export function PlatformMasterConsumption({
  companyId,
  actorId,
  service,
}: {
  companyId: string;
  actorId?: number;
  service: AdministrationApi;
}) {
  const [page, setPage] = useState(0);
  const options = {
    retry: false as const,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  };
  const usage = useQuery(
    adminQueryKey(companyId, actorId, 'platform-master-usage'),
    () => service.platformUsage(companyId),
    options,
  );
  const params = { skip: page * 10, take: 10 };
  const history = useQuery(
    adminQueryKey(companyId, actorId, 'platform-master-generations', params),
    () => service.platformHistory(companyId, params),
    { ...options, keepPreviousData: true },
  );
  const refresh = () => {
    void usage.refetch();
    void history.refetch();
  };
  return (
    <Box>
      <Typography variant="h6">Consumo MASTER da plataforma</Typography>
      <Alert severity="info" sx={{ my: 2 }}>
        Consumo atribuído à SimpleSST. Não utiliza franquias comerciais da
        plataforma ou da empresa atendida. Custos calculados pelo uso informado
        pelo provedor, sujeitos à conferência de faturamento.
      </Alert>
      <Button
        disabled={usage.isFetching || history.isFetching}
        onClick={refresh}
      >
        Atualizar consumo MASTER
      </Button>
      {(usage.isLoading || history.isLoading) && (
        <CircularProgress aria-label="Carregando consumo MASTER" />
      )}
      {(usage.isError || history.isError) && (
        <Alert severity="error">
          {((usage.error || history.error) as Error).message}
        </Alert>
      )}
      {usage.data && (
        <Box sx={{ my: 2 }}>
          <Typography>Tentativas: {usage.data.attempts}</Typography>
          <Typography>
            Custo calculado: US$ {usage.data.confirmedCalculatedCostUsd}
          </Typography>
          <Typography>
            Reservas pendentes: US$ {usage.data.pendingReservationsUsd}
          </Typography>
          <Typography>
            Resultados incertos: {usage.data.unknownAttempts}
          </Typography>
        </Box>
      )}
      {history.data && (
        <>
          <TableContainer>
            <Table size="small" aria-label="Histórico financeiro MASTER">
              <TableHead>
                <TableRow>
                  {[
                    'Data',
                    'Responsável',
                    'Empresa atendida',
                    'Elemento',
                    'Status',
                    'Reserva (US$)',
                    'Custo calculado (US$)',
                  ].map((label) => (
                    <TableCell key={label}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {history.data.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {row.requestedBy?.name || row.requestedById}
                    </TableCell>
                    <TableCell>
                      {row.targetCompany?.name || row.targetCompany?.id}
                    </TableCell>
                    <TableCell>
                      {row.characterization?.name ||
                        row.characterizationId ||
                        'Elemento excluído'}
                    </TableCell>
                    <TableCell>
                      {statusLabels[row.status] || row.status}
                    </TableCell>
                    <TableCell>
                      {row.reservedUsd} (pendente: {row.pendingReservationUsd})
                    </TableCell>
                    <TableCell>
                      {row.confirmedCalculatedCostUsd ?? 'Não confirmado'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {history.data.count === 0 && (
            <Typography>Nenhuma geração MASTER registrada.</Typography>
          )}
          <TablePagination
            component="div"
            count={history.data.count}
            page={page}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            onPageChange={(_, next) => setPage(next)}
            nextIconButtonProps={{
              disabled:
                history.isFetching || (page + 1) * 10 >= history.data.count,
            }}
            backIconButtonProps={{ disabled: history.isFetching || page === 0 }}
          />
        </>
      )}
    </Box>
  );
}
