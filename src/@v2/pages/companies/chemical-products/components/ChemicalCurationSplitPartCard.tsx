import { SText } from '@v2/components/atoms/SText/SText';
import type {
  AiChemicalCandidate,
  ChemicalRiskOption,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
} from '@mui/material';

import { ChemicalCurationIdentityEditor } from './ChemicalCurationIdentityEditor';
import type {
  ChemicalCurationIdentityDraft,
  ChemicalCurationSplitPartDraft,
} from './chemical-ai-curation-draft.util';
import type { ChemicalCurationPendingManualFactor } from './chemical-curation-create-risk.util';

function partConfidenceLabel(confidence: string | null | undefined) {
  if (confidence === 'HIGH') return 'Alta';
  if (confidence === 'MEDIUM') return 'Média';
  if (confidence === 'LOW') return 'Baixa';
  return confidence || '—';
}

type Props = {
  partIndex: number;
  part: ChemicalCurationSplitPartDraft;
  identity: ChemicalCurationIdentityDraft;
  aiCandidate?: AiChemicalCandidate;
  pendingFactor: ChemicalCurationPendingManualFactor | null;
  searchQuery: string;
  searchResults: ChemicalRiskOption[];
  searchBusy: boolean;
  canCreateRisk: boolean;
  showCreateRisk: boolean;
  disabled?: boolean;
  onIdentityChange: (next: ChemicalCurationIdentityDraft) => void;
  onConfirmIdentity: (next: ChemicalCurationIdentityDraft) => void;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onSelectFactor: (factor: ChemicalCurationPendingManualFactor) => void;
  onClearFactor: () => void;
  onConfirmManualFactor: () => void;
  onKeepUnlinked: () => void;
  onRejectPart: () => void;
  onUndoResolution: () => void;
  onOpenCreateRisk: () => void;
};

function resolutionLabel(
  part: ChemicalCurationSplitPartDraft,
): string {
  if (!part.resolution) return 'Sem resolução';
  if (part.resolution.action === 'MANUAL_FACTOR') return 'Fator confirmado';
  if (part.resolution.action === 'KEEP_UNLINKED') return 'Sem vínculo';
  if (part.resolution.action === 'REJECT_PART') return 'Parte rejeitada';
  return part.resolution.action;
}

export function ChemicalCurationSplitPartCard({
  partIndex,
  part,
  identity,
  aiCandidate,
  pendingFactor,
  searchQuery,
  searchResults,
  searchBusy,
  showCreateRisk,
  disabled,
  onIdentityChange,
  onConfirmIdentity,
  onSearchQueryChange,
  onSearch,
  onSelectFactor,
  onClearFactor,
  onConfirmManualFactor,
  onKeepUnlinked,
  onRejectPart,
  onUndoResolution,
  onOpenCreateRisk,
}: Props) {
  const resolved = Boolean(part.resolution);
  const rejected = part.resolution?.action === 'REJECT_PART';

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: rejected
          ? 'error.light'
          : resolved
            ? 'success.light'
            : 'divider',
        borderRadius: 1,
        bgcolor: 'background.default',
      }}
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <SText fontSize={13} fontWeight={700}>
            Parte {partIndex + 1}
          </SText>
          <Chip size="small" label={`id ${part.partId}`} variant="outlined" />
          <Chip
            size="small"
            color={
              rejected ? 'error' : resolved ? 'success' : 'default'
            }
            label={resolutionLabel(part)}
          />
          {identity.identityConfirmed && !rejected ? (
            <Chip size="small" color="success" label="Identidade ok" />
          ) : null}
        </Stack>

        <SText fontSize={11} color="text.secondary">
          Texto original da parte:{' '}
          <strong>{part.originalText || '—'}</strong>
        </SText>

        {aiCandidate ? (
          <Alert severity="info" sx={{ py: 0 }}>
            Sugestão IA: {aiCandidate.officialName || '—'}
            {aiCandidate.cas ? ` · CAS ${aiCandidate.cas}` : ''}
            {' · '}
            confiança {partConfidenceLabel(aiCandidate.confidence)}
            {aiCandidate.rationale
              ? ` — ${aiCandidate.rationale.slice(0, 160)}`
              : ''}
          </Alert>
        ) : null}

        {!rejected ? (
          <ChemicalCurationIdentityEditor
            draft={identity}
            aiSynonyms={aiCandidate?.synonyms || []}
            originalPlanilhaText={part.originalText}
            disabled={disabled || resolved}
            onChange={onIdentityChange}
            onConfirmIdentity={onConfirmIdentity}
            title={`Identidade — Parte ${partIndex + 1}`}
          />
        ) : null}

        {!resolved && !rejected ? (
          <Stack spacing={0.75}>
            <SText fontSize={12} fontWeight={600}>
              Vínculo com fator (esta parte)
            </SText>
            {pendingFactor ? (
              <Alert
                severity="success"
                action={
                  <Button color="inherit" size="small" onClick={onClearFactor}>
                    Trocar fator
                  </Button>
                }
              >
                Fator pré-vinculado:{' '}
                <strong>{pendingFactor.officialName}</strong>
                {pendingFactor.cas ? ` · CAS ${pendingFactor.cas}` : ''}
              </Alert>
            ) : (
              <>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Buscar fator"
                    value={searchQuery}
                    disabled={disabled}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                  />
                  <Button
                    size="small"
                    disabled={disabled || searchBusy}
                    onClick={onSearch}
                  >
                    Buscar
                  </Button>
                </Stack>
                {searchResults.map((risk) => (
                  <Button
                    key={risk.id}
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      onSelectFactor({
                        riskFactorId: risk.id,
                        officialName: risk.name,
                        cas: risk.cas ?? null,
                      })
                    }
                  >
                    Escolher: {risk.name}
                    {risk.cas ? ` [${risk.cas}]` : ''}
                  </Button>
                ))}
                {showCreateRisk ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    disabled={disabled}
                    onClick={onOpenCreateRisk}
                  >
                    Cadastrar fator químico
                  </Button>
                ) : null}
              </>
            )}

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {pendingFactor ? (
                <Button
                  size="small"
                  variant="contained"
                  disabled={disabled || !identity.identityConfirmed}
                  onClick={onConfirmManualFactor}
                >
                  Confirmar vínculo
                </Button>
              ) : null}
              <Button
                size="small"
                disabled={disabled || !identity.identityConfirmed}
                onClick={onKeepUnlinked}
              >
                Manter sem vínculo
              </Button>
              <Button
                size="small"
                color="warning"
                disabled={disabled}
                onClick={onRejectPart}
              >
                Rejeitar parte
              </Button>
            </Stack>
            {!identity.identityConfirmed ? (
              <SText fontSize={11} color="text.secondary">
                Confirme a identidade desta parte antes de vincular ou manter
                sem vínculo.
              </SText>
            ) : null}
          </Stack>
        ) : null}

        {resolved ? (
          <Stack direction="row" spacing={1}>
            <Button size="small" disabled={disabled} onClick={onUndoResolution}>
              Desfazer resolução
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
