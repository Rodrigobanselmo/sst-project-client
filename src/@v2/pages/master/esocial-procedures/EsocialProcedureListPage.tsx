import { FC, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchBrowseEsocialProcedures } from '@v2/services/medicine/esocial-procedure/hooks/useFetchBrowseEsocialProcedures';
import { useMutateDeleteEsocialProcedure } from '@v2/services/medicine/esocial-procedure/hooks/useMutateEsocialProcedure';
import {
  EsocialProcedureStatusEnum,
  EsocialProcedureTypeEnum,
  IEsocialProcedureItem,
} from '@v2/services/medicine/esocial-procedure/service/esocial-procedure.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  esocialProcedureStatusLabels,
  esocialProcedureTypeLabels,
} from './esocial-procedure-labels';
import { EsocialProcedureFormModal } from './components/EsocialProcedureFormModal';
import { EsocialProcedureImportExportMenu } from './components/EsocialProcedureImportExportMenu';
import { EsocialProcedureTable } from './components/EsocialProcedureTable';

const ALL = 'ALL';

export const EsocialProcedureListPage: FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EsocialProcedureStatusEnum | typeof ALL>(
    ALL,
  );
  const [technicalType, setTechnicalType] = useState<
    EsocialProcedureTypeEnum | typeof ALL
  >(ALL);
  const [onlyRelevant, setOnlyRelevant] = useState(false);
  const [onlyCurated, setOnlyCurated] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IEsocialProcedureItem | null>(null);
  const [toDelete, setToDelete] = useState<IEsocialProcedureItem | null>(null);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_ESOCIAL_PROCEDURES);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading } = useFetchBrowseEsocialProcedures({
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    status: status === ALL ? undefined : status,
    technicalType: technicalType === ALL ? undefined : technicalType,
    // Envia apenas `true`; a API parseia boolean implicitamente e "false"
    // seria ambíguo. Filtro tri-state evitado de propósito nesta fase.
    isOccupationalRelevant: onlyRelevant ? true : undefined,
    onlyCurated: onlyCurated ? true : undefined,
  });

  const deleteMutation = useMutateDeleteEsocialProcedure();

  const handleEdit = (item: IEsocialProcedureItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!toDelete?.curation) return;
    deleteMutation.mutate(
      { id: toDelete.curation.id },
      { onSuccess: () => setToDelete(null) },
    );
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
              Curadoria SimpleSST — Procedimentos da Tabela 27 (eSocial)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Camada de curadoria sobre os procedimentos oficiais da Tabela 27 do
              eSocial. A Tabela 27 oficial é apenas leitura e permanece
              intocável; aqui o MASTER classifica relevância ocupacional, tipo
              técnico, status e observações para uso no PCMSO.
            </Typography>
          </Box>
          <EsocialProcedureImportExportMenu />
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
            <TextField
              label="Buscar (código ou nome)"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 240 }}
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as EsocialProcedureStatusEnum | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              {Object.values(EsocialProcedureStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {esocialProcedureStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Tipo técnico"
              value={technicalType}
              onChange={(event) => {
                setTechnicalType(
                  event.target.value as EsocialProcedureTypeEnum | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 170 }}
            >
              <MenuItem value={ALL}>Todos</MenuItem>
              {Object.values(EsocialProcedureTypeEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {esocialProcedureTypeLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={onlyRelevant}
                  onChange={(event) => {
                    setOnlyRelevant(event.target.checked);
                    setPage(1);
                  }}
                />
              }
              label="Somente relevantes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyCurated}
                  onChange={(event) => {
                    setOnlyCurated(event.target.checked);
                    setPage(1);
                  }}
                />
              }
              label="Somente curados"
            />
          </Box>

          <EsocialProcedureTable
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

      <EsocialProcedureFormModal
        open={formOpen}
        item={editing}
        onClose={() => setFormOpen(false)}
      />

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Remover curadoria</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover a curadoria deste procedimento? Esta
            ação faz soft delete apenas da camada SimpleSST. A Tabela 27 oficial
            do eSocial não é afetada.
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
