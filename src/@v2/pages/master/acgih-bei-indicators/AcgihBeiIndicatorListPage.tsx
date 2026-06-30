import { FC, useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchBrowseAcgihBeiIndicators } from '@v2/services/medicine/acgih-bei-indicator/hooks/useFetchBrowseAcgihBeiIndicators';
import { useMutateDeleteAcgihBeiIndicator } from '@v2/services/medicine/acgih-bei-indicator/hooks/useMutateAcgihBeiIndicator';
import { getAcgihBeiIndicatorById } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.service';
import {
  AcgihBeiIndicatorConfidenceEnum,
  AcgihBeiIndicatorStatusEnum,
  IAcgihBeiIndicator,
} from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  acgihBeiConfidenceLabels,
  acgihBeiStatusLabels,
} from './acgih-bei-indicator-labels';
import { AcgihBeiIndicatorFormModal } from './components/AcgihBeiIndicatorFormModal';
import { AcgihBeiIndicatorImportExportMenu } from './components/AcgihBeiIndicatorImportExportMenu';
import { AcgihBeiIndicatorTable } from './components/AcgihBeiIndicatorTable';

const ALL = 'ALL';

export const AcgihBeiIndicatorListPage: FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [biologicalMatrix, setBiologicalMatrix] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<
    AcgihBeiIndicatorStatusEnum | typeof ALL
  >(ALL);
  const [confidence, setConfidence] = useState<
    AcgihBeiIndicatorConfidenceEnum | typeof ALL
  >(ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IAcgihBeiIndicator | null>(null);
  const [toDelete, setToDelete] = useState<IAcgihBeiIndicator | null>(null);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_ACGIH_BEI_INDICATORS);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading } = useFetchBrowseAcgihBeiIndicators({
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    biologicalMatrix: biologicalMatrix.trim() || undefined,
    status: status === ALL ? undefined : status,
    confidence: confidence === ALL ? undefined : confidence,
  });

  const deleteMutation = useMutateDeleteAcgihBeiIndicator();

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (item: IAcgihBeiIndicator) => {
    setEditing(item);
    setFormOpen(true);
  };

  useEffect(() => {
    const id = router.query.id;
    if (typeof id !== 'string' || !id.trim()) return;

    let cancelled = false;
    getAcgihBeiIndicatorById(id.trim())
      .then((indicator) => {
        if (cancelled) return;
        setEditing(indicator);
        setFormOpen(true);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [router.query.id]);

  const handleConfirmDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(
      { id: toDelete.id },
      { onSuccess: () => setToDelete(null) },
    );
  };

  // Filtros rápidos de curadoria (reaproveitam os filtros server-side já existentes).
  const draftActive = status === AcgihBeiIndicatorStatusEnum.DRAFT;
  const lowConfidenceActive =
    confidence === AcgihBeiIndicatorConfidenceEnum.LOW;

  const toggleDraft = () => {
    setStatus(draftActive ? ALL : AcgihBeiIndicatorStatusEnum.DRAFT);
    setPage(1);
  };

  const toggleLowConfidence = () => {
    setConfidence(
      lowConfidenceActive ? ALL : AcgihBeiIndicatorConfidenceEnum.LOW,
    );
    setPage(1);
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h5">
              ACGIH/BEI — Indicadores biológicos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base técnica de referência internacional ACGIH/BEI. Lista isolada e
              curável; não altera NR-7, Tabela 27/eSocial, XML, S-2220/S-2240,
              ExamToRisk, empresas nem a Biblioteca Risco × Exame automaticamente.
              A cobertura e as divergências em relação à NR-7 e às regras ficam na
              análise de elegibilidade.
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() =>
                router.push(RoutesEnum.DATABASE_ACGIH_BEI_COMPARISON)
              }
              sx={{ px: 0, mt: 0.5 }}
            >
              Ver análise de elegibilidade (ACGIH/BEI × NR-7 × Regras)
            </Button>
          </Box>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <AcgihBeiIndicatorImportExportMenu />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Novo indicador
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Filtros rápidos:
            </Typography>
            <Button
              size="small"
              variant={draftActive ? 'contained' : 'outlined'}
              color={draftActive ? 'warning' : 'inherit'}
              onClick={toggleDraft}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Rascunhos
            </Button>
            <Button
              size="small"
              variant={lowConfidenceActive ? 'contained' : 'outlined'}
              color={lowConfidenceActive ? 'error' : 'inherit'}
              onClick={toggleLowConfidence}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Baixa confiança
            </Button>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
            <TextField
              label="Buscar (substância, CAS ou determinante)"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 280 }}
            />
            <TextField
              label="Matriz biológica"
              value={biologicalMatrix}
              onChange={(event) => {
                setBiologicalMatrix(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as
                    | AcgihBeiIndicatorStatusEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              {Object.values(AcgihBeiIndicatorStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Confiança"
              value={confidence}
              onChange={(event) => {
                setConfidence(
                  event.target.value as
                    | AcgihBeiIndicatorConfidenceEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiIndicatorConfidenceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiConfidenceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <AcgihBeiIndicatorTable
            data={data?.data ?? []}
            isLoading={isLoading}
            pagination={{
              total: data?.count ?? 0,
              limit: pageLimit,
              page,
            }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            onEdit={handleEdit}
            onDelete={setToDelete}
          />
        </Paper>
      </Box>

      <AcgihBeiIndicatorFormModal
        open={formOpen}
        item={editing}
        onClose={() => setFormOpen(false)}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Remover indicador</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover este indicador ACGIH/BEI? Esta ação faz
            soft delete apenas na base técnica ACGIH/BEI e pode ser restaurada por
            uma nova importação.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </SAuthShow>
  );
};
