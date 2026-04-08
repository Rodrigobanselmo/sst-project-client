import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchBrowseFormPreliminaryLibraryQuestions } from '@v2/services/forms/form-preliminary-library/browse-form-preliminary-library-questions/hooks/useFetchBrowseFormPreliminaryLibraryQuestions';
import { FormPreliminaryLibraryQuestionListItemApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
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
import {
  translatePreliminaryLibraryCategory,
  translatePreliminaryLibraryQuestionType,
} from '@v2/pages/companies/forms/components/FormContent/components/PreliminaryLibraryContent/preliminary-library-labels';

const PAGE_SIZE = 15;

export const AddLibraryQuestionDialog = ({
  open,
  onClose,
  companyId,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
  onPick: (question: FormPreliminaryLibraryQuestionListItemApi) => void;
}) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<
    '' | 'DEMOGRAPHIC' | 'ORGANIZATIONAL' | 'SEGMENTATION' | 'OTHER'
  >('');

  const query = useMemo(
    () => ({
      companyId,
      page: page + 1,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      category: category === '' ? undefined : category,
      enabled: open,
    }),
    [companyId, page, search, category, open],
  );

  const { browseResult, isLoading } =
    useFetchBrowseFormPreliminaryLibraryQuestions(query);

  const count = browseResult?.count ?? 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Adicionar pergunta da biblioteca</DialogTitle>
      <DialogContent>
        <SFlex direction="column" gap={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Escolha uma pergunta para copiar para o questionário. O conteúdo será
            independente da biblioteca após adicionar.
          </Typography>
          <SFlex gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              placeholder="Buscar"
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
              sx={{ minWidth: 240, flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                displayEmpty
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as typeof category);
                  setPage(0);
                }}
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                <MenuItem value="DEMOGRAPHIC">Demográfica</MenuItem>
                <MenuItem value="ORGANIZATIONAL">Organizacional</MenuItem>
                <MenuItem value="SEGMENTATION">Segmentação</MenuItem>
                <MenuItem value="OTHER">Outra</MenuItem>
              </Select>
            </FormControl>
          </SFlex>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell align="right" width={120}>
                  Ação
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">Carregando…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (browseResult?.data?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">
                      Nenhuma pergunta encontrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                browseResult?.data?.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {translatePreliminaryLibraryCategory(row.category)}
                    </TableCell>
                    <TableCell>
                      {translatePreliminaryLibraryQuestionType(row.question_type)}
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
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => onPick(row)}
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
