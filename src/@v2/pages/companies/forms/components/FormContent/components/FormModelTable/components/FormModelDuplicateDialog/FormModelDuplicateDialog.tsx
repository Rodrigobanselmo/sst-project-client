import { useAppRouter } from '@v2/hooks/useAppRouter';
import { FormBrowseResultModel } from '@v2/models/form/models/form/form-browse-result.model';
import { PageRoutes } from '@v2/constants/pages/routes';
import { useFetchBrowseFormModel } from '@v2/services/forms/form/browse-form-model/hooks/useFetchBrowseFormModel';
import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';
import { useDuplicateFormModel } from '@v2/services/forms/form/duplicate-form-model/hooks/useDuplicateFormModel';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
};

export const FormModelDuplicateDialog = ({
  open,
  onClose,
  companyId,
}: Props) => {
  const router = useAppRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<FormBrowseResultModel | null>(null);

  const browseParams = useMemo(
    () => ({
      companyId,
      filters: { search: debouncedSearch || undefined },
      orderBy: [
        { field: FormModelOrderByEnum.NAME, order: 'asc' as const },
      ],
      pagination: { page: 1, limit: 100 },
    }),
    [companyId, debouncedSearch],
  );

  const { formModel, isLoading } = useFetchBrowseFormModel(browseParams, {
    enabled: open && Boolean(companyId),
  });

  const duplicateMutation = useDuplicateFormModel();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
      setSelected(null);
    }
  }, [open]);

  const options = formModel?.results ?? [];

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      const data = await duplicateMutation.mutateAsync({
        companyId,
        sourceFormId: selected.id,
      });
      onClose();
      router.push(PageRoutes.FORMS.FORMS_MODEL.EDIT, {
        pathParams: { companyId, id: data.id },
      });
    } catch {
      // Feedback de erro: snackbar via onError do useDuplicateFormModel
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Copiar modelo existente</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ mt: 2 }}
          options={options}
          value={selected}
          onChange={(_, value) => {
            setSelected(value);
            if (value) setSearch(value.name);
          }}
          inputValue={search}
          onInputChange={(_, value, reason) => {
            if (reason === 'input' || reason === 'clear' || reason === 'reset') {
              setSearch(value);
            }
          }}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={isLoading}
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Modelo de origem"
              placeholder="Pesquisar por nome..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<FileCopyOutlined />}
          disabled={!selected || duplicateMutation.isPending}
          onClick={() => void handleConfirm()}
        >
          Duplicar e editar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
