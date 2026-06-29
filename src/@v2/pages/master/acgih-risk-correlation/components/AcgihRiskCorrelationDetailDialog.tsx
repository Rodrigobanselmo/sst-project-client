import { FC } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { IAcgihRiskCorrelationItem } from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

import {
  cardinalityColors,
  cardinalityLabels,
  decisionSourceColors,
  decisionSourceLabels,
  finalStatusColors,
  finalStatusLabels,
  formatConfidence,
  formatMatchMethod,
} from '../acgih-risk-correlation-labels';

type Props = {
  item: IAcgihRiskCorrelationItem | null;
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

export const AcgihRiskCorrelationDetailDialog: FC<Props> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <Dialog open={Boolean(item)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Correlação — {item.substanceName}
        <Box display="flex" gap={1} mt={1} flexWrap="wrap">
          <Chip
            size="small"
            color={finalStatusColors[item.finalStatus]}
            label={finalStatusLabels[item.finalStatus]}
          />
          <Chip
            size="small"
            variant="outlined"
            color={decisionSourceColors[item.decisionSource]}
            label={decisionSourceLabels[item.decisionSource]}
          />
          <Chip
            size="small"
            variant="outlined"
            color={cardinalityColors[item.cardinality]}
            label={cardinalityLabels[item.cardinality]}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 1 }}>
          Preview somente leitura. Nenhum vínculo é criado nesta etapa.
        </Alert>

        <SectionTitle>Dados ACGIH/BEI</SectionTitle>
        <Row label="Substância" value={item.substanceName} />
        <Row label="CAS" value={item.cas} />
        <Row label="Matriz biológica" value={item.matrix} />
        <Row label="Determinante" value={item.determinant} />
        <Row label="ACGIH/BEI Indicator ID" value={item.acgihBeiIndicatorId} />

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Promoção / vínculo (banco atual)</SectionTitle>
        <Row label="Promovido" value={item.promoted ? 'Sim' : 'Não'} />
        <Row
          label="Indicador oficial (ID)"
          value={item.officialIndicatorId}
        />
        <Row label="Já vinculado" value={item.alreadyLinked ? 'Sim' : 'Não'} />

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Classificação</SectionTitle>
        <Row
          label="Status automático"
          value={finalStatusLabels[item.autoStatus]}
        />
        <Row label="Status final" value={finalStatusLabels[item.finalStatus]} />
        <Row
          label="Fonte da decisão"
          value={decisionSourceLabels[item.decisionSource]}
        />
        <Row
          label="Cardinalidade"
          value={cardinalityLabels[item.cardinality]}
        />
        <Row label="Nota" value={item.note} />

        <Divider sx={{ my: 1.5 }} />
        <SectionTitle>Fator(es) de Risco vinculável(is)</SectionTitle>
        {item.links.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum Fator de Risco correlacionado.
          </Typography>
        ) : (
          item.links.map((link) => (
            <Box
              key={link.riskFactorId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {link.riskName}
                {link.isGroup ? ' (grupo)' : ''}
              </Typography>
              <Row label="RiskFactor ID" value={link.riskFactorId} />
              <Row label="CAS (bruto)" value={link.riskCasRaw} />
              <Row
                label="CAS (normalizado)"
                value={link.riskCasParsed.join(', ')}
              />
              <Row
                label="Método de match"
                value={formatMatchMethod(link.matchMethod)}
              />
              <Row
                label="Confiança"
                value={formatConfidence(link.confidence)}
              />
            </Box>
          ))
        )}

        {item.blockers.length > 0 && (
          <>
            <SectionTitle>Bloqueios</SectionTitle>
            <Box display="flex" flexDirection="column" gap={0.25}>
              {item.blockers.map((b) => (
                <Typography key={b} variant="body2" color="error.main">
                  • {b}
                </Typography>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
