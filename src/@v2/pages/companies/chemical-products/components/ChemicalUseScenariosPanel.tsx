import { SText } from '@v2/components/atoms/SText/SText';
import { browseChemicalUseScenarios } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type { ChemicalUseScenarioListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  companyId: string;
  workspaceId: string;
  chemicalProductId?: string;
  refreshKey?: number;
};

export const ChemicalUseScenariosPanel = ({
  companyId,
  workspaceId,
  chemicalProductId,
  refreshKey = 0,
}: Props) => {
  const [rows, setRows] = useState<ChemicalUseScenarioListItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ChemicalUseScenarioListItem | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    browseChemicalUseScenarios({
      companyId,
      workspaceId,
      chemicalProductId,
      search: search || undefined,
    })
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Não foi possível carregar os cenários de uso.',
          );
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, workspaceId, chemicalProductId, search, refreshKey]);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        mb={1.5}
      >
        <SText fontWeight={700}>Cenários de uso</SText>
        <TextField
          size="small"
          label="Buscar tarefa / setor / produto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <SText fontSize={13}>Carregando…</SText> : null}
      {!loading && !rows.length ? (
        <Alert severity="info">
          Nenhum cenário de uso cadastrado. Use “Importar levantamento
          (SURVEY)” ou crie via API após a migration.
        </Alert>
      ) : null}
      {rows.length ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Tarefa</TableCell>
              <TableCell>Setor</TableCell>
              <TableCell>Freq.</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell>Qtd</TableCell>
              <TableCell>Linhas</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.product.tradeName}</TableCell>
                <TableCell>{row.activityName || '—'}</TableCell>
                <TableCell>{row.sectorSnapshot || '—'}</TableCell>
                <TableCell>
                  {row.frequencyCount != null
                    ? `${row.frequencyCount} ${row.frequencyPeriod || ''}`
                    : '—'}
                </TableCell>
                <TableCell>
                  {row.durationMinutes != null
                    ? `${row.durationMinutes} min`
                    : '—'}
                </TableCell>
                <TableCell>
                  {row.quantity
                    ? `${row.quantity} ${row.quantityUnit || ''}`
                    : '—'}
                </TableCell>
                <TableCell>{(row.sourceRows || []).join(', ') || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.surveyStatus} />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setSelected(row)}>
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Cenário de uso</DialogTitle>
        <DialogContent>
          {selected ? (
            <Stack spacing={1.5} mt={1}>
              <SText fontWeight={700}>{selected.product.tradeName}</SText>
              <SText fontSize={13} color="text.secondary">
                {selected.product.manufacturer
                  ? `Fabricante: ${selected.product.manufacturer}`
                  : 'Sem fabricante'}
              </SText>
              <SText fontSize={13}>Tarefa: {selected.activityName || '—'}</SText>
              <SText fontSize={13}>
                Setor: {selected.sectorSnapshot || '—'} · GHE/GSE:{' '}
                {selected.exposureGroupSnapshot || '—'} · Cargos:{' '}
                {selected.exposedRolesSnapshot || '—'}
              </SText>
              <SText fontSize={13}>
                Frequência: {selected.frequencyCount ?? '—'}{' '}
                {selected.frequencyPeriod || ''} · Duração:{' '}
                {selected.durationMinutes ?? '—'} min · Quantidade:{' '}
                {selected.quantity || '—'} {selected.quantityUnit || ''}
              </SText>
              <SText fontSize={13}>
                Contato: {selected.peakContactMoment || '—'} · Controles:{' '}
                {selected.controlMeasures || '—'}
              </SText>
              <SText fontSize={13}>
                Linhas-fonte ({selected.sourceSheet || '—'}):{' '}
                {(selected.sourceRows || []).join(', ') || '—'}
              </SText>
              <SText fontWeight={600}>Composição herdada do produto</SText>
              {(selected.product.activeComposition?.ingredients || []).map(
                (ingredient) => (
                  <SText key={ingredient.id} fontSize={13}>
                    {ingredient.chemicalName}
                    {ingredient.cas ? ` · CAS ${ingredient.cas}` : ''}
                  </SText>
                ),
              )}
              {!selected.product.activeComposition?.ingredients?.length ? (
                <SText fontSize={13} color="text.secondary">
                  Sem composição ACTIVE neste produto.
                </SText>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
