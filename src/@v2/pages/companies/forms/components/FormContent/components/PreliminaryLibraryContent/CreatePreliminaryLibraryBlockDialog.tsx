import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useFetchBrowseFormPreliminaryLibraryQuestions } from '@v2/services/forms/form-preliminary-library/browse-form-preliminary-library-questions/hooks/useFetchBrowseFormPreliminaryLibraryQuestions';
import { useCreateFormPreliminaryLibraryBlock } from '@v2/services/forms/form-preliminary-library/create-form-preliminary-library-block/hooks/useCreateFormPreliminaryLibraryBlock';
import { FormPreliminaryLibraryQuestionListItemApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

const BROWSE_LIMIT = 100;

export const CreatePreliminaryLibraryBlockDialog = ({
  open,
  onClose,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
}) => {
  const createMutation = useCreateFormPreliminaryLibraryBlock();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pickerSearch, setPickerSearch] = useState('');
  const [orderedQuestionIds, setOrderedQuestionIds] = useState<string[]>([]);
  const [pickedNames, setPickedNames] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const browseQuery = useMemo(
    () => ({
      companyId,
      page: 1,
      limit: BROWSE_LIMIT,
      search: pickerSearch.trim() || undefined,
      enabled: open,
    }),
    [companyId, pickerSearch, open],
  );

  const { browseResult, isLoading: browseLoading } =
    useFetchBrowseFormPreliminaryLibraryQuestions(browseQuery);

  const questionById = useMemo(() => {
    const map = new Map<string, FormPreliminaryLibraryQuestionListItemApi>();
    browseResult?.data?.forEach((q) => map.set(q.id, q));
    return map;
  }, [browseResult?.data]);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setPickerSearch('');
      setOrderedQuestionIds([]);
      setPickedNames({});
      setLocalError(null);
    }
  }, [open]);

  const pickerOptions = useMemo(() => {
    const rows = browseResult?.data ?? [];
    const set = new Set(orderedQuestionIds);
    return rows.filter((q) => !set.has(q.id));
  }, [browseResult?.data, orderedQuestionIds]);

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= orderedQuestionIds.length) return;
    setOrderedQuestionIds((ids) => {
      const copy = [...ids];
      const t = copy[index];
      copy[index] = copy[next];
      copy[next] = t;
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setOrderedQuestionIds((ids) => ids.filter((_, i) => i !== index));
  };

  const addQuestion = (q: FormPreliminaryLibraryQuestionListItemApi | null) => {
    if (!q) return;
    setPickerSearch('');
    setPickedNames((m) => ({ ...m, [q.id]: q.name }));
    setOrderedQuestionIds((ids) =>
      ids.includes(q.id) ? ids : [...ids, q.id],
    );
  };

  const handleSubmit = async () => {
    setLocalError(null);
    const n = name.trim();
    if (!n) {
      setLocalError('Informe o nome do bloco.');
      return;
    }
    if (orderedQuestionIds.length === 0) {
      setLocalError('Adicione pelo menos uma pergunta ao bloco.');
      return;
    }

    await createMutation.mutateAsync({
      companyId,
      name: n,
      description: description.trim() || null,
      items: orderedQuestionIds.map((libraryQuestionId, order) => ({
        libraryQuestionId,
        order,
      })),
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo bloco da empresa</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Monte o bloco com perguntas já existentes na biblioteca (sistema ou
            empresa), na ordem em que devem aparecer.
          </Typography>
          {localError && <Alert severity="error">{localError}</Alert>}
          <TextField
            label="Nome do bloco"
            size="small"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Descrição (opcional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Autocomplete
            options={pickerOptions}
            loading={browseLoading}
            getOptionLabel={(o) => o.name}
            value={null}
            inputValue={pickerSearch}
            onInputChange={(_, v) => setPickerSearch(v)}
            onChange={(_, v) => {
              addQuestion(v);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Adicionar pergunta do acervo"
                size="small"
                placeholder="Busque pelo nome"
              />
            )}
          />
          <Typography variant="subtitle2">Ordem no bloco</Typography>
          {orderedQuestionIds.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma pergunta adicionada.
            </Typography>
          ) : (
            <List dense disablePadding>
              {orderedQuestionIds.map((id, index) => {
                const q = questionById.get(id);
                const title = pickedNames[id] ?? q?.name ?? id;
                return (
                  <ListItem
                    key={id}
                    secondaryAction={
                      <SFlex alignItems="center" gap={0}>
                        <IconButton
                          edge="end"
                          aria-label="Mover para cima"
                          size="small"
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0}
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="Mover para baixo"
                          size="small"
                          onClick={() => moveItem(index, 1)}
                          disabled={index === orderedQuestionIds.length - 1}
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="Remover"
                          size="small"
                          onClick={() => removeItem(index)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </SFlex>
                    }
                  >
                    <ListItemText primary={title} />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={createMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={createMutation.isPending}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
