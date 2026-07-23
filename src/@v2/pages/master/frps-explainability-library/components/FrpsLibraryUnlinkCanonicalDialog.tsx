import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';
import { useFetchPreviewRiskCatalogEquivalenceImpact } from '@v2/services/risk-catalog-equivalence/hooks/useFetchPreviewRiskCatalogEquivalenceImpact';
import {
  RiskCatalogKind,
  type RiskCatalogImpactPreview,
} from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.types';

import { getFrpsLibraryItemTypeLabel } from '../frps-explainability-library-filters.util';
import {
  FRPS_UNLINK_CANONICAL_ACTION_LABEL,
  FRPS_UNLINK_DEFAULT_REVOKE_REASON,
  buildFrpsUnlinkImpactCopy,
  isFrpsUnlinkRevokeReasonValid,
} from '../frps-library-unlink-canonical.util';

function renderImpactPreview(preview: RiskCatalogImpactPreview) {
  if (preview.kind === RiskCatalogKind.GENERATE_SOURCE) {
    const g = preview.generateSource;
    return (
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <li>RiskFactorData com alias: {g.riskFactorDataWithAlias}</li>
        <li>RiskFactorData com canônico: {g.riskFactorDataWithCanonical}</li>
        <li>Duplicatas se migrasse: {g.riskFactorDataDuplicateIfMigrated}</li>
        <li>Vínculos M2M com alias: {g.m2mLinksWithAlias}</li>
      </Box>
    );
  }

  const r = preview.recMed;
  return (
    <Box component="ul" sx={{ m: 0, pl: 2 }}>
      <li>RecMedOnRiskData com alias: {r.recMedOnRiskDataWithAlias}</li>
      <li>Engs com alias: {r.engsToRiskFactorDataWithAlias}</li>
      <li>ADMs (RiskFactorData) com alias: {r.admsM2mLinksWithAlias}</li>
      <li>Plano de ação (RiskFactorDataRec): {r.riskFactorDataRecWithAlias}</li>
      <li>
        Medidas derivadas: {r.riskFactorDataRecDerivedMeasureWithAlias}
      </li>
    </Box>
  );
}

export type FrpsLibraryUnlinkCanonicalTarget = {
  alias: FrpsCatalogAdminItem;
  equivalenceId: string;
  canonicalId: string;
  canonicalLabel: string;
};

export function FrpsLibraryUnlinkCanonicalDialog({
  open,
  target,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  target: FrpsLibraryUnlinkCanonicalTarget | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (revokeReason: string) => void;
}) {
  const [revokeReason, setRevokeReason] = useState(
    FRPS_UNLINK_DEFAULT_REVOKE_REASON,
  );

  useEffect(() => {
    if (open) {
      setRevokeReason(FRPS_UNLINK_DEFAULT_REVOKE_REASON);
    }
  }, [open, target?.equivalenceId]);

  const impactParams = useMemo(() => {
    if (!target) return null;
    return {
      kind:
        target.alias.kind === 'REC_MED'
          ? RiskCatalogKind.REC_MED
          : RiskCatalogKind.GENERATE_SOURCE,
      riskId: target.alias.riskId,
      canonicalId: target.canonicalId,
      aliasId: target.alias.id,
    };
  }, [target]);

  const { data: impactPreview, isLoading: impactLoading } =
    useFetchPreviewRiskCatalogEquivalenceImpact(impactParams);

  const impactCopy = target
    ? buildFrpsUnlinkImpactCopy({ origin: target.alias.origin })
    : null;
  const canConfirm = isFrpsUnlinkRevokeReasonValid(revokeReason);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{FRPS_UNLINK_CANONICAL_ACTION_LABEL}</DialogTitle>
      <DialogContent>
        {target ? (
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Typography variant="body2">
              Item: <strong>{target.alias.label}</strong>
            </Typography>
            <Typography variant="body2">
              Canônico atual: <strong>{target.canonicalLabel}</strong>
            </Typography>
            <Typography variant="body2">
              Origem: {target.alias.origin === 'GLOBAL' ? 'Global' : 'Local'} ·
              Tipo: {getFrpsLibraryItemTypeLabel(target.alias.itemType)}
            </Typography>

            {impactCopy ? (
              <>
                <Alert severity="info">{impactCopy.base}</Alert>
                <Alert severity="warning">{impactCopy.originSpecific}</Alert>
              </>
            ) : null}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Prévia de impacto (sem migração)
              </Typography>
              {impactLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Carregando prévia…
                  </Typography>
                </Box>
              ) : impactPreview ? (
                renderImpactPreview(impactPreview)
              ) : (
                <Alert severity="warning">
                  Prévia de impacto indisponível no momento. A confirmação
                  revoga apenas esta equivalência (alias → canônico atual);
                  nenhum outro alias do canônico é alterado.
                </Alert>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              required
              label="Motivo da revogação"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              error={!canConfirm}
              helperText={
                canConfirm
                  ? undefined
                  : 'Informe um motivo para confirmar a desvinculação.'
              }
            />
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={!canConfirm || isSubmitting || !target}
          onClick={() => onConfirm(revokeReason.trim())}
        >
          {isSubmitting ? 'Desvinculando…' : 'Confirmar desvinculação'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
