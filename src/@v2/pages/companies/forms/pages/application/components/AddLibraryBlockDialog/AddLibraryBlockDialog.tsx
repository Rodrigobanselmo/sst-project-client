import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchBrowseFormPreliminaryLibraryBlocks } from '@v2/services/forms/form-preliminary-library/browse-form-preliminary-library-blocks/hooks/useFetchBrowseFormPreliminaryLibraryBlocks';
import { readFormPreliminaryLibraryBlock } from '@v2/services/forms/form-preliminary-library/read-form-preliminary-library-block/service/read-form-preliminary-library-block.service';
import { FormPreliminaryLibraryBlockDetailApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

const PAGE_SIZE = 15;

export const AddLibraryBlockDialog = ({
  open,
  onClose,
  companyId,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  onPick: (block: FormPreliminaryLibraryBlockDetailApi) => void;
}) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      companyId,
      page: page + 1,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      enabled: open,
    }),
    [companyId, page, search, open],
  );

  const { browseResult, isLoading } =
    useFetchBrowseFormPreliminaryLibraryBlocks(query);

  const count = browseResult?.count ?? 0;

  const handleAdd = async (blockId: string) => {
    setLoadingBlockId(blockId);
    try {
      const detail = await readFormPreliminaryLibraryBlock({
        companyId,
        blockId,
      });
      onPick(detail);
    } finally {
      setLoadingBlockId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Adicionar bloco da biblioteca</DialogTitle>
      <DialogContent>
        <SFlex direction="column" gap={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Escolha um bloco para copiar todas as perguntas para o questionário,
            na ordem definida na biblioteca.
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar blocos"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell align="right" width={120}>
                  Ação
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">Carregando…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (browseResult?.data?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">
                      Nenhum bloco encontrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                browseResult?.data?.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography noWrap title={row.description ?? ''}>
                        {row.description ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.system ? 'Sistema' : 'Empresa'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={loadingBlockId !== null}
                        startIcon={
                          loadingBlockId === row.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <AddCircleOutlineIcon />
                          )
                        }
                        onClick={() => handleAdd(row.id)}
                      >
                        Adicionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onRowsPerPageChange={() => undefined}
            labelRowsPerPage="Linhas"
          />
        </SFlex>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
