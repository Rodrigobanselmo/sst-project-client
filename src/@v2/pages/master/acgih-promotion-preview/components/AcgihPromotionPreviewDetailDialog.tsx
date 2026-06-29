import { FC } from 'react';

import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AcgihPromotionEligibilityStatusEnum,
  IAcgihPromotionPreviewItem,
} from '@v2/services/medicine/acgih-promotion-preview/service/acgih-promotion-preview.types';

import {
  duplicateRiskLabels,
  eligibilityStatusColors,
  eligibilityStatusLabels,
  formatBlocker,
  formatMissingField,
  momentConfidenceLabels,
  tierLabels,
} from '../acgih-promotion-preview-labels';

type Props = {
  item: IAcgihPromotionPreviewItem | null;
  onClose: () => void;
};

const Row: FC<{ label: string; value?: string | number | null }> = ({
  label,
  value,
}) => (
  <Box display="flex" gap={1} alignItems="baseline">
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ minWidth: 200, fontWeight: 600 }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
      {value === null || value === undefined || value === '' ? '—' : value}
    </Typography>
  </Box>
);

const SectionTitle: FC<{ children: string }> = ({ children }) => (
  <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5 }}>
    {children}
  </Typography>
);

export const AcgihPromotionPreviewDetailDialog: FC<Props> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const payload = item.proposedOfficialPayload;
  const snapshot = item.comparisonSnapshot;
  const applicability = Object.entries(payload.occupationalApplicability ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ');

  return (
    <Dialog open={Boolean(item)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Preview — {item.substanceName}
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          <Chip
            size="small"
            color={eligibilityStatusColors[item.eligibilityStatus]}
            label={eligibilityStatusLabels[item.eligibilityStatus]}
          />
          <Chip
            size="small"
            variant="outlined"
            label={tierLabels[item.eligibilityTier]}
          />
          <Chip
            size="small"
            variant="outlined"
            label={duplicateRiskLabels[item.duplicateRisk]}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 1 }}>
          Preview somente leitura. Nenhum indicador será criado nesta etapa.
        </Alert>

        <Typography variant="body2" color="text.secondary">
          {item.eligibilityReason}
        </Typography>

        {item.blockers.length > 0 && (
          <>
            <SectionTitle>Bloqueios</SectionTitle>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {item.blockers.map((code) => (
                <Chip
                  key={code}
                  size="small"
                  color="error"
                  variant="outlined"
                  label={formatBlocker(code)}
                />
              ))}
            </Box>
          </>
        )}

        {item.warnings.length > 0 && (
          <>
            <SectionTitle>Avisos</SectionTitle>
            <Box display="flex" flexDirection="column" gap={0.25}>
              {item.warnings.map((w) => (
                <Typography key={w} variant="body2" color="warning.main">
                  • {w}
                </Typography>
              ))}
            </Box>
          </>
        )}

        {item.missingFields.length > 0 && (
          <>
            <SectionTitle>Campos ausentes</SectionTitle>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {item.missingFields.map((f) => (
                <Chip
                  key={f}
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={formatMissingField(f)}
                />
              ))}
            </Box>
          </>
        )}

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Momento de coleta</SectionTitle>
        <Row label="Original (ACGIH)" value={item.mappedFields.collectionMoment.original} />
        <Row label="Mapeado (NR-7)" value={item.mappedFields.collectionMoment.mappedValue} />
        <Row
          label="Confiança do mapeamento"
          value={momentConfidenceLabels[item.mappedFields.collectionMoment.confidence]}
        />

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Payload oficial proposto (preview-only)</SectionTitle>
        <Row label="Fonte normativa" value={payload.normativeSource} />
        <Row label="Origem do dado" value={payload.dataOrigin} />
        <Row label="Status inicial" value={payload.status} />
        <Row
          label="Revisão normativa exigida"
          value={payload.requiresNormativeReview ? 'Sim' : 'Não'}
        />
        <Row label="Substância" value={payload.substanceName} />
        <Row label="CAS primário" value={payload.casPrimary} />
        <Row label="CAS (lista)" value={payload.casNumbers.join(', ')} />
        <Row label="Determinante (original)" value={payload.biologicalIndicatorOriginal} />
        <Row label="Matriz biológica" value={payload.biologicalMatrix} />
        <Row label="Momento de coleta" value={payload.collectionMoment} />
        <Row label="Valor de referência" value={payload.referenceValue} />
        <Row label="Unidade" value={payload.unit} />
        <Row label="Versão normativa proposta" value={payload.normativeVersion} />
        <Row label="Página da fonte" value={payload.sourcePage} />
        <Row label="Aplicabilidade (default conservador)" value={applicability} />
        <Row label="Chave de idempotência" value={payload.idempotencyKey} />

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Snapshot da comparação (4O)</SectionTitle>
        <Row label="Status bruto" value={snapshot.comparisonStatus} />
        <Row label="Status operacional" value={snapshot.operationalStatus} />
        <Row label="Decisão técnica" value={snapshot.reviewDecision} />
        <Row label="Nota técnica" value={snapshot.reviewNote} />
        <Row
          label="Tem fonte complementar"
          value={snapshot.hasComplementaryReference ? 'Sim' : 'Não'}
        />
      </DialogContent>
      <DialogActions>
        <Tooltip title="Aplicação real será tratada na 4P.2">
          <span>
            <Button disabled variant="contained">
              Promover (4P.2)
            </Button>
          </span>
        </Tooltip>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
