import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { useFetchBrowseFormPreliminaryLibraryBlocks } from '@v2/services/forms/form-preliminary-library/browse-form-preliminary-library-blocks/hooks/useFetchBrowseFormPreliminaryLibraryBlocks';
import { useFetchBrowseFormPreliminaryLibraryQuestions } from '@v2/services/forms/form-preliminary-library/browse-form-preliminary-library-questions/hooks/useFetchBrowseFormPreliminaryLibraryQuestions';
import { useDeleteFormPreliminaryLibraryBlock } from '@v2/services/forms/form-preliminary-library/delete-form-preliminary-library-block/hooks/useDeleteFormPreliminaryLibraryBlock';
import { useDeleteFormPreliminaryLibraryQuestion } from '@v2/services/forms/form-preliminary-library/delete-form-preliminary-library-question/hooks/useDeleteFormPreliminaryLibraryQuestion';
import { useFetchReadFormPreliminaryLibraryBlock } from '@v2/services/forms/form-preliminary-library/read-form-preliminary-library-block/hooks/useFetchReadFormPreliminaryLibraryBlock';
import { useFetchReadFormPreliminaryLibraryQuestion } from '@v2/services/forms/form-preliminary-library/read-form-preliminary-library-question/hooks/useFetchReadFormPreliminaryLibraryQuestion';
import { FormPreliminaryLibraryCategoryApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAccess } from 'core/hooks/useAccess';
import { RoleEnum } from 'project/enum/roles.enums';
import { useMemo, useState } from 'react';
import { CreatePreliminaryLibraryBlockDialog } from './CreatePreliminaryLibraryBlockDialog';
import { CreatePreliminaryLibraryQuestionDialog } from './CreatePreliminaryLibraryQuestionDialog';
import { PreliminaryLibraryBlockDetailDialog } from './PreliminaryLibraryBlockDetailDialog';
import { PreliminaryLibraryQuestionDetailDialog } from './PreliminaryLibraryQuestionDetailDialog';
import {
  translatePreliminaryLibraryCategory,
  translatePreliminaryLibraryQuestionType,
} from './preliminary-library-labels';

const PAGE_SIZE = 20;

type LibraryInnerTab = 'questions' | 'blocks';

type ConfirmDeleteTarget = {
  kind: 'question' | 'block';
  id: string;
  name: string;
  isSystem: boolean;
};

export const PreliminaryLibraryContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { isValidRoles } = useAccess();
  const canDeleteSystemItems = isValidRoles([RoleEnum.MASTER]);

  const [innerTab, setInnerTab] = useState<LibraryInnerTab>('questions');
  const [questionPage, setQuestionPage] = useState(0);
  const [blockPage, setBlockPage] = useState(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [blockSearch, setBlockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    FormPreliminaryLibraryCategoryApi | ''
  >('');

  const questionQuery = useMemo(
    () => ({
      companyId,
      page: questionPage + 1,
      limit: PAGE_SIZE,
      search: questionSearch.trim() || undefined,
      category:
        categoryFilter === ''
          ? undefined
          : (categoryFilter as FormPreliminaryLibraryCategoryApi),
    }),
    [companyId, questionPage, questionSearch, categoryFilter],
  );

  const blockQuery = useMemo(
    () => ({
      companyId,
      page: blockPage + 1,
      limit: PAGE_SIZE,
      search: blockSearch.trim() || undefined,
    }),
    [companyId, blockPage, blockSearch],
  );

  const { browseResult: questionsResult, isLoading: questionsLoading } =
    useFetchBrowseFormPreliminaryLibraryQuestions({
      ...questionQuery,
      enabled: innerTab === 'questions',
    });

  const { browseResult: blocksResult, isLoading: blocksLoading } =
    useFetchBrowseFormPreliminaryLibraryBlocks({
      ...blockQuery,
      enabled: innerTab === 'blocks',
    });

  const [questionDetailId, setQuestionDetailId] = useState<string | null>(null);
  const [blockDetailId, setBlockDetailId] = useState<string | null>(null);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] =
    useState<ConfirmDeleteTarget | null>(null);

  const deleteQuestionMutation = useDeleteFormPreliminaryLibraryQuestion();
  const deleteBlockMutation = useDeleteFormPreliminaryLibraryBlock();
  const deleteBusy =
    deleteQuestionMutation.isPending || deleteBlockMutation.isPending;

  const { question: questionDetail, isLoading: questionDetailLoading } =
    useFetchReadFormPreliminaryLibraryQuestion({
      companyId,
      questionId: questionDetailId ?? '',
      enabled: !!questionDetailId,
    });

  const { block: blockDetail, isLoading: blockDetailLoading } =
    useFetchReadFormPreliminaryLibraryBlock({
      companyId,
      blockId: blockDetailId ?? '',
      enabled: !!blockDetailId,
    });

  const questionCount = questionsResult?.count ?? 0;
  const blockCount = blocksResult?.count ?? 0;

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const { kind, id } = confirmDelete;
    if (kind === 'question') {
      deleteQuestionMutation.mutate(
        { companyId, questionId: id },
        {
          onSuccess: () => {
            setConfirmDelete(null);
            if (questionDetailId === id) setQuestionDetailId(null);
          },
        },
      );
    } else {
      deleteBlockMutation.mutate(
        { companyId, blockId: id },
        {
          onSuccess: () => {
            setConfirmDelete(null);
            if (blockDetailId === id) setBlockDetailId(null);
          },
        },
      );
    }
  };

  return (
    <SFlex direction="column" gap={3}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          Biblioteca de Perguntas Preliminares
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Perguntas e blocos reutilizáveis (sistema e da empresa). Itens de
          sistema: somente leitura para usuários da empresa; exclusão apenas
          para master.
        </Typography>
      </Box>

      <Paper
        square
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs
          value={innerTab}
          onChange={(_, v) => setInnerTab(v)}
          aria-label="Biblioteca preliminar"
        >
          <Tab value="questions" label="Perguntas" />
          <Tab value="blocks" label="Blocos" />
        </Tabs>
      </Paper>

      {innerTab === 'questions' && (
        <Box>
          <SFlex gap={2} flexWrap="wrap" alignItems="center" mb={2}>
            <TextField
              size="small"
              placeholder="Buscar perguntas"
              value={questionSearch}
              onChange={(e) => {
                setQuestionSearch(e.target.value);
                setQuestionPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                displayEmpty
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as typeof categoryFilter);
                  setQuestionPage(0);
                }}
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                <MenuItem value="DEMOGRAPHIC">Demográfica</MenuItem>
                <MenuItem value="ORGANIZATIONAL">Organizacional</MenuItem>
                <MenuItem value="SEGMENTATION">Segmentação</MenuItem>
                <MenuItem value="OTHER">Outra</MenuItem>
              </Select>
            </FormControl>
            <Box flex={1} sx={{ minWidth: 8 }} />
            <STableAddButton onClick={() => setCreateQuestionOpen(true)} />
          </SFlex>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell align="right" width={128}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questionsLoading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">Carregando…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!questionsLoading &&
                (questionsResult?.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        Nenhuma pergunta encontrada.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              {!questionsLoading &&
                questionsResult?.data?.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      {translatePreliminaryLibraryCategory(row.category)}
                    </TableCell>
                    <TableCell>
                      {translatePreliminaryLibraryQuestionType(
                        row.question_type,
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.system ? 'Sistema' : 'Empresa'}
                        variant={row.system ? 'outlined' : 'filled'}
                        color={row.system ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.25}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          aria-label="Ver detalhe"
                          size="small"
                          onClick={() => setQuestionDetailId(row.id)}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        {(!row.system || canDeleteSystemItems) && (
                          <IconButton
                            aria-label="Excluir pergunta"
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({
                                kind: 'question',
                                id: row.id,
                                name: row.name,
                                isSystem: row.system,
                              })
                            }
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={questionCount}
            page={questionPage}
            onPageChange={(_, p) => setQuestionPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onRowsPerPageChange={() => undefined}
            labelRowsPerPage="Linhas"
          />
        </Box>
      )}

      {innerTab === 'blocks' && (
        <Box>
          <SFlex gap={2} flexWrap="wrap" alignItems="center" mb={2}>
            <TextField
              size="small"
              placeholder="Buscar blocos"
              value={blockSearch}
              onChange={(e) => {
                setBlockSearch(e.target.value);
                setBlockPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />
            <Box flex={1} sx={{ minWidth: 8 }} />
            <STableAddButton onClick={() => setCreateBlockOpen(true)} />
          </SFlex>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Origem</TableCell>
                <TableCell align="right" width={128}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocksLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">Carregando…</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!blocksLoading && (blocksResult?.data?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">
                      Nenhum bloco encontrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!blocksLoading &&
                blocksResult?.data?.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography noWrap title={row.description ?? ''}>
                        {row.description ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.system ? 'Sistema' : 'Empresa'}
                        variant={row.system ? 'outlined' : 'filled'}
                        color={row.system ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.25}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          aria-label="Ver detalhe"
                          size="small"
                          onClick={() => setBlockDetailId(row.id)}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                        {(!row.system || canDeleteSystemItems) && (
                          <IconButton
                            aria-label="Excluir bloco"
                            size="small"
                            color="error"
                            onClick={() =>
                              setConfirmDelete({
                                kind: 'block',
                                id: row.id,
                                name: row.name,
                                isSystem: row.system,
                              })
                            }
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={blockCount}
            page={blockPage}
            onPageChange={(_, p) => setBlockPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onRowsPerPageChange={() => undefined}
            labelRowsPerPage="Linhas"
          />
        </Box>
      )}

      <PreliminaryLibraryQuestionDetailDialog
        open={!!questionDetailId}
        onClose={() => setQuestionDetailId(null)}
        question={questionDetail}
        isLoading={!!questionDetailId && questionDetailLoading}
      />

      <PreliminaryLibraryBlockDetailDialog
        open={!!blockDetailId}
        onClose={() => setBlockDetailId(null)}
        block={blockDetail}
        isLoading={!!blockDetailId && blockDetailLoading}
      />

      <CreatePreliminaryLibraryQuestionDialog
        open={createQuestionOpen}
        onClose={() => setCreateQuestionOpen(false)}
        companyId={companyId}
      />

      <CreatePreliminaryLibraryBlockDialog
        open={createBlockOpen}
        onClose={() => setCreateBlockOpen(false)}
        companyId={companyId}
      />

      <Dialog
        open={!!confirmDelete}
        onClose={() => !deleteBusy && setConfirmDelete(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDelete?.kind === 'block'
            ? 'Excluir bloco da biblioteca'
            : 'Excluir pergunta da biblioteca'}
        </DialogTitle>
        <DialogContent>
          {confirmDelete?.kind === 'block' ? (
            <Typography variant="body2" sx={{ pt: 0.5 }}>
              Tem certeza que deseja excluir o bloco &quot;{confirmDelete?.name}
              &quot;? Ele deixará de aparecer na biblioteca.
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ pt: 0.5 }}>
              Tem certeza que deseja excluir a pergunta &quot;
              {confirmDelete?.name}
              &quot;? Ela deixará de aparecer na biblioteca.
              {confirmDelete?.isSystem
                ? ' Esta é uma pergunta global do sistema.'
                : ' Se ainda estiver em algum bloco ativo, a exclusão será recusada.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={deleteBusy}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteBusy}
            onClick={handleConfirmDelete}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </SFlex>
  );
};
