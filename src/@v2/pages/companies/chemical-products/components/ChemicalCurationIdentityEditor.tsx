import { SText } from '@v2/components/atoms/SText/SText';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
} from '@mui/material';

import {
  applyIdentityDraftEdit,
  confirmIdentityDraft,
  validateCasClientFeedback,
  type ChemicalCurationIdentityDraft,
} from './chemical-ai-curation-draft.util';

type Props = {
  draft: ChemicalCurationIdentityDraft;
  aiSynonyms?: string[];
  originalPlanilhaText: string;
  disabled?: boolean;
  onChange: (next: ChemicalCurationIdentityDraft) => void;
  onConfirmIdentity: (next: ChemicalCurationIdentityDraft) => void;
  /** Título do bloco (padrão: Identidade química — edição) */
  title?: string;
};

export function ChemicalCurationIdentityEditor({
  draft,
  aiSynonyms = [],
  originalPlanilhaText,
  disabled,
  onChange,
  onConfirmIdentity,
  title = 'Identidade química — edição manual',
}: Props) {
  const casFeedback = validateCasClientFeedback(draft.cas);
  const synonymsText = draft.synonyms.join(', ');

  const patch = (
    partial: Parameters<typeof applyIdentityDraftEdit>[1],
  ) => {
    onChange(applyIdentityDraftEdit(draft, partial, aiSynonyms));
  };

  const handleCasBlur = () => {
    if (!draft.cas?.trim()) {
      patch({ cas: null });
      return;
    }
    const check = validateCasClientFeedback(draft.cas);
    if (check.normalized !== String(draft.cas || '').trim()) {
      patch({ cas: check.normalized || null });
    }
  };

  const handleConfirm = () => {
    const result = confirmIdentityDraft(draft, aiSynonyms);
    onChange(result.draft);
    if (!result.error) {
      onConfirmIdentity(result.draft);
    }
  };

  const confirmAttempt = confirmIdentityDraft(draft, aiSynonyms);
  const confirmError = !draft.identityConfirmed
    ? confirmAttempt.error
    : null;

  return (
    <Box
      sx={{
        p: 1.25,
        border: '1px solid',
        borderColor: draft.identityConfirmed ? 'success.light' : 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1}>
        <SText fontSize={12} fontWeight={600}>
          {title}
        </SText>

        <Stack spacing={0.25}>
          <SText fontSize={11} color="text.secondary">
            Texto original da planilha
          </SText>
          <SText fontSize={12}>{originalPlanilhaText || '—'}</SText>
        </Stack>

        <Stack spacing={0.25}>
          <SText fontSize={11} color="text.secondary">
            Sugestão da IA (somente leitura)
          </SText>
          <SText fontSize={12}>
            {draft.originalSuggestion?.officialName || '—'}
            {draft.originalSuggestion?.cas
              ? ` · CAS ${draft.originalSuggestion.cas}`
              : ' · sem CAS'}
          </SText>
        </Stack>

        <TextField
          size="small"
          fullWidth
          label="Nome químico (manual)"
          value={draft.officialName}
          disabled={disabled}
          onChange={(e) => patch({ officialName: e.target.value })}
        />
        <TextField
          size="small"
          fullWidth
          label="CAS (manual)"
          value={draft.cas ?? ''}
          disabled={disabled}
          error={Boolean(draft.cas?.trim()) && !casFeedback.ok}
          helperText={
            draft.cas?.trim() && !casFeedback.ok
              ? casFeedback.message
              : 'Nome sem CAS é permitido. CAS preenchido exige nome.'
          }
          onChange={(e) => patch({ cas: e.target.value || null })}
          onBlur={handleCasBlur}
        />
        <TextField
          size="small"
          fullWidth
          label="Sinônimos (separados por vírgula)"
          value={synonymsText}
          disabled={disabled}
          onChange={(e) =>
            patch({
              synonyms: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <TextField
          size="small"
          fullWidth
          label="Fonte manual"
          value={draft.manualSource || ''}
          disabled={disabled}
          onChange={(e) => patch({ manualSource: e.target.value })}
        />
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Justificativa / observação técnica"
          value={draft.manualJustification || ''}
          disabled={disabled}
          onChange={(e) => patch({ manualJustification: e.target.value })}
        />

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            color={draft.origin === 'HUMAN' ? 'warning' : 'default'}
            label={draft.origin === 'HUMAN' ? 'Origem: humana' : 'Origem: IA'}
          />
          {draft.identityConfirmed ? (
            <Chip size="small" color="success" label="Identidade confirmada" />
          ) : (
            <Chip size="small" label="Identidade pendente de confirmação" />
          )}
        </Stack>

        {draft.identityConfirmed ? (
          <Alert severity="success" sx={{ py: 0 }}>
            Identidade confirmada. O item ainda aguarda resolução final (vínculo
            com fator ou manter sem vínculo).
          </Alert>
        ) : null}

        {confirmError && draft.officialName.trim() ? (
          <Alert severity="warning" sx={{ py: 0 }}>
            {confirmError}
          </Alert>
        ) : null}

        <Button
          size="small"
          variant="outlined"
          disabled={disabled || draft.identityConfirmed}
          onClick={handleConfirm}
        >
          Confirmar identidade
        </Button>
      </Stack>
    </Box>
  );
}
