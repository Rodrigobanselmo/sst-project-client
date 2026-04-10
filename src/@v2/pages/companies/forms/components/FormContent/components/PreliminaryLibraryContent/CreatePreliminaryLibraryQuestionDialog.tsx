import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { useCreateFormPreliminaryLibraryQuestion } from '@v2/services/forms/form-preliminary-library/create-form-preliminary-library-question/hooks/useCreateFormPreliminaryLibraryQuestion';
import {
  FormPreliminaryLibraryCategoryApi,
  FormPreliminaryLibraryQuestionTypeApi,
} from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  translatePreliminaryLibraryCategory,
  translatePreliminaryLibraryQuestionType,
} from './preliminary-library-labels';

const LIBRARY_IDENTIFIER_TYPES = (
  Object.values(FormIdentifierTypeEnum) as FormIdentifierTypeEnum[]
).filter((t) => t !== FormIdentifierTypeEnum.SECTOR);

type OptRow = { text: string; value: string };

const defaultOptRows = (): OptRow[] => [
  { text: '', value: '' },
  { text: '', value: '' },
];

const initialForm = () => ({
  name: '',
  questionText: '',
  questionType: 'TEXT' as FormPreliminaryLibraryQuestionTypeApi,
  category: 'OTHER' as FormPreliminaryLibraryCategoryApi,
  identifierType: FormIdentifierTypeEnum.CUSTOM,
  acceptOther: false,
});

export const CreatePreliminaryLibraryQuestionDialog = ({
  open,
  onClose,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  companyId: string;
}) => {
  const createMutation = useCreateFormPreliminaryLibraryQuestion();
  const [form, setForm] = useState(initialForm);
  const [optRows, setOptRows] = useState<OptRow[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(initialForm());
      setOptRows([]);
      setLocalError(null);
    }
  }, [open]);

  const needsCustomOptions = useMemo(
    () =>
      form.questionType === 'SINGLE_CHOICE' &&
      form.identifierType === FormIdentifierTypeEnum.CUSTOM,
    [form.questionType, form.identifierType],
  );

  const onQuestionTypeChange = (questionType: FormPreliminaryLibraryQuestionTypeApi) => {
    setForm((f) => ({ ...f, questionType }));
    if (questionType === 'TEXT') {
      setOptRows([]);
      return;
    }
    if (form.identifierType === FormIdentifierTypeEnum.CUSTOM) {
      setOptRows((rows) => (rows.length >= 2 ? rows : defaultOptRows()));
    } else {
      setOptRows([]);
    }
  };

  const onIdentifierTypeChange = (identifierType: FormIdentifierTypeEnum) => {
    setForm((f) => ({ ...f, identifierType }));
    if (form.questionType !== 'SINGLE_CHOICE') return;
    if (identifierType === FormIdentifierTypeEnum.CUSTOM) {
      setOptRows((rows) => (rows.length >= 2 ? rows : defaultOptRows()));
    } else {
      setOptRows([]);
    }
  };

  const handleSubmit = async () => {
    setLocalError(null);
    const name = form.name.trim();
    const questionText = form.questionText.trim();
    if (!name || !questionText) {
      setLocalError('Preencha o nome interno e o texto da pergunta.');
      return;
    }

    let options: {
      text: string;
      order: number;
      value: number | null;
    }[] = [];

    if (form.questionType === 'TEXT') {
      options = [];
    } else if (needsCustomOptions) {
      const filled = optRows.filter((r) => r.text.trim().length > 0);
      if (filled.length < 2) {
        setLocalError(
          'Para escolha única com identificador customizado, informe pelo menos duas opções com texto.',
        );
        return;
      }
      for (const row of optRows) {
        if (row.text.trim() && row.value.trim() !== '') {
          const n = Number.parseInt(row.value, 10);
          if (Number.isNaN(n)) {
            setLocalError('Valores numéricos das opções devem ser inteiros válidos.');
            return;
          }
        }
      }
      options = optRows
        .filter((r) => r.text.trim().length > 0)
        .map((row, index) => ({
          text: row.text.trim(),
          order: index,
          value:
            row.value.trim() === ''
              ? null
              : Number.parseInt(row.value, 10),
        }));
    } else {
      options = [];
    }

    await createMutation.mutateAsync({
      companyId,
      name,
      questionText,
      questionType: form.questionType,
      category: form.category,
      identifierType: form.identifierType,
      acceptOther: form.acceptOther,
      options,
    });

    onClose();
  };

  const addOptionRow = () => {
    setOptRows((rows) => [...rows, { text: '', value: '' }]);
  };

  const removeOptionRow = (index: number) => {
    setOptRows((rows) => rows.filter((_, i) => i !== index));
  };

  const updateOptionRow = (index: number, patch: Partial<OptRow>) => {
    setOptRows((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova pergunta da empresa</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            A pergunta será criada somente para esta empresa e poderá ser usada
            em blocos e formulários.
          </Typography>
          {localError && <Alert severity="error">{localError}</Alert>}
          <TextField
            label="Nome interno"
            size="small"
            fullWidth
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Texto da pergunta"
            size="small"
            fullWidth
            required
            multiline
            minRows={3}
            value={form.questionText}
            onChange={(e) =>
              setForm((f) => ({ ...f, questionText: e.target.value }))
            }
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              label="Categoria"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as FormPreliminaryLibraryCategoryApi,
                }))
              }
            >
              {(
                [
                  'DEMOGRAPHIC',
                  'ORGANIZATIONAL',
                  'SEGMENTATION',
                  'OTHER',
                ] as const
              ).map((c) => (
                <MenuItem key={c} value={c}>
                  {translatePreliminaryLibraryCategory(c)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de pergunta</InputLabel>
            <Select
              label="Tipo de pergunta"
              value={form.questionType}
              onChange={(e) =>
                onQuestionTypeChange(
                  e.target.value as FormPreliminaryLibraryQuestionTypeApi,
                )
              }
            >
              <MenuItem value="TEXT">
                {translatePreliminaryLibraryQuestionType('TEXT')}
              </MenuItem>
              <MenuItem value="SINGLE_CHOICE">
                {translatePreliminaryLibraryQuestionType('SINGLE_CHOICE')}
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de identificador</InputLabel>
            <Select
              label="Tipo de identificador"
              value={form.identifierType}
              onChange={(e) =>
                onIdentifierTypeChange(e.target.value as FormIdentifierTypeEnum)
              }
            >
              {LIBRARY_IDENTIFIER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {FormIdentifierTypeTranslate[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.acceptOther}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acceptOther: e.target.checked }))
                }
              />
            }
            label='Aceitar resposta "Outro"'
          />
          {needsCustomOptions && (
            <SFlex direction="column" gap={1.5} alignItems="stretch">
              <Typography variant="subtitle2">Opções (mínimo 2)</Typography>
              {optRows.map((row, index) => (
                <SFlex key={index} gap={1} alignItems="flex-start">
                  <TextField
                    size="small"
                    label="Texto"
                    fullWidth
                    value={row.text}
                    onChange={(e) =>
                      updateOptionRow(index, { text: e.target.value })
                    }
                  />
                  <TextField
                    size="small"
                    label="Valor (opcional)"
                    sx={{ maxWidth: 140 }}
                    value={row.value}
                    onChange={(e) =>
                      updateOptionRow(index, { value: e.target.value })
                    }
                  />
                  <IconButton
                    aria-label="Remover opção"
                    size="small"
                    onClick={() => removeOptionRow(index)}
                    disabled={optRows.length <= 2}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </SFlex>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addOptionRow}
              >
                Opção
              </Button>
            </SFlex>
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
