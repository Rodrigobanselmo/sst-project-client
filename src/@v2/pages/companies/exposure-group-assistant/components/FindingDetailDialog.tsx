import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import type { InterpretedRecommendation } from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';

import { ATTENTION_LEVEL_LABEL_PT, STANCE_LABEL_PT } from './diagnosis-labels';
import { resolveReviewHref } from './resolve-review-href';

function coverageLabel(coverage?: string): string {
  switch (coverage) {
    case 'DIRECT':
      return 'direta';
    case 'INDIRECT_FULL':
      return 'indireta integral';
    case 'INDIRECT_PARTIAL':
      return 'indireta parcial';
    case 'UNKNOWN':
      return 'possível, não confirmada';
    case 'GAP':
      return 'não identificada';
    case 'NONE':
      return 'sem universo de trabalhadores';
    default:
      return 'não classificada';
  }
}

type Props = {
  recommendation: InterpretedRecommendation | null;
  companyId: string;
  workspaceId?: string;
  onClose: () => void;
};

export function RecommendationDetailDialog({
  recommendation,
  companyId,
  workspaceId,
  onClose,
}: Props) {
  const open = Boolean(recommendation);
  const href = recommendation
    ? resolveReviewHref({
        companyId,
        workspaceId,
        recommendation,
      })
    : null;

  const stats = recommendation?.workerCoverageStats;
  const peers = recommendation?.peerCoverageSources ?? [];
  const coverageSources = recommendation?.coverageSources ?? [];
  const structuralPeers = peers.filter((p) => p.relationKind !== 'CO_MEMBERSHIP_ONLY');
  const isUnknownCoverage = recommendation?.workerRiskCoverage === 'UNKNOWN';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {recommendation ? (
        <>
          <DialogTitle>
            {recommendation.title}
            {recommendation.primaryEntityName ? (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                {recommendation.primaryEntityName}
              </Typography>
            ) : null}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={STANCE_LABEL_PT[recommendation.stance]} />
                <Chip
                  size="small"
                  label={`Prioridade de revisão: ${ATTENTION_LEVEL_LABEL_PT[recommendation.attentionLevel]}`}
                />
              </Stack>

              {(recommendation.entityKindLabel ||
                recommendation.entityStatusLabel != null ||
                recommendation.directRiskCount != null) && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Identificação
                  </Typography>
                  <Typography variant="body2" component="div">
                    {recommendation.entityKindLabel ? (
                      <div>Tipo: {recommendation.entityKindLabel}</div>
                    ) : null}
                    {recommendation.entityStatusLabel ? (
                      <div>Status: {recommendation.entityStatusLabel}</div>
                    ) : null}
                    {recommendation.directRiskCount != null ? (
                      <div>Riscos diretos: {recommendation.directRiskCount}</div>
                    ) : null}
                    {recommendation.workerRiskCoverage ? (
                      <div>
                        Cobertura: {coverageLabel(recommendation.workerRiskCoverage)}
                      </div>
                    ) : null}
                    {!isUnknownCoverage && structuralPeers.length > 0 ? (
                      <div>
                        Origem da cobertura:{' '}
                        {structuralPeers
                          .map((p) =>
                            p.relationKindLabel
                              ? `${p.label} (${p.relationKindLabel})`
                              : p.label,
                          )
                          .filter(Boolean)
                          .join('; ')}
                      </div>
                    ) : null}
                    {isUnknownCoverage && coverageSources.length > 0 ? (
                      <div>
                        Indício (não confirma cobertura):{' '}
                        {coverageSources
                          .filter((s) => s.relationKind === 'CO_MEMBERSHIP_ONLY')
                          .map((s) => s.sourceElementLabel)
                          .filter(Boolean)
                          .join('; ')}
                      </div>
                    ) : null}
                    {stats && stats.totalWorkers > 0 ? (
                      <div>
                        Trabalhadores abrangidos:{' '}
                        {stats.coveredDirectly + stats.coveredIndirectly} de{' '}
                        {stats.totalWorkers}
                        {stats.coveragePercent != null
                          ? ` (${Math.round(stats.coveragePercent)}%)`
                          : ''}
                        {stats.uncovered > 0
                          ? ` · sem cobertura identificada: ${stats.uncovered}`
                          : ''}
                        {stats.coMembershipOnly > 0
                          ? ` · apenas em comum: ${stats.coMembershipOnly}`
                          : ''}
                      </div>
                    ) : null}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Situação encontrada
                </Typography>
                <Typography variant="body2">{recommendation.situation}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Por que isso merece atenção?
                </Typography>
                <Typography variant="body2">{recommendation.whyAttention}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Quando isso é esperado?
                </Typography>
                <Typography variant="body2">{recommendation.whenExpected}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Como revisar
                </Typography>
                <Typography variant="body2">{recommendation.howToReview}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Entidades afetadas — total {recommendation.totalAffectedCount}
                  {recommendation.affectedTruncated
                    ? ` (amostra: ${recommendation.affectedEntities.length})`
                    : ''}
                </Typography>
                <Typography variant="body2" component="div">
                  {recommendation.affectedEntities.slice(0, 15).map((e) => (
                    <div key={`${e.entityType}:${e.entityId}`}>
                      {e.label || String(e.entityId)}
                    </div>
                  ))}
                </Typography>
                {recommendation.affectedTruncated ? (
                  <Typography variant="caption" color="text.secondary">
                    Amostra limitada para leitura; o total acima reflete a contagem
                    completa desta recomendação.
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
            {href ? (
              <Button
                variant="contained"
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign(href);
                }}
              >
                Revisar na tela correspondente
              </Button>
            ) : null}
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
