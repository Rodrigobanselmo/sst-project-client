import { GseConsultativeInfo } from './GseConsultativeInfo';
import { professionalGseText } from './gse-ai-consultative';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import {
  runExposureGroupDiagnosis,
  runSimilarityProposals,
} from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.service';
import type { ExposureGroupAssistantDiagnosisResponse } from '@v2/services/security/exposure-group-assistant/service/exposure-group-assistant.types';
import {
  adaptOccupationalAnalysis,
  occupationalTechnicalSections,
  recognitionLabel,
} from './gse-occupational-adapter';

type Analysis = ReturnType<typeof adaptOccupationalAnalysis>;
/** Mounted with a company/workspace key: results never cross panel scopes. Read endpoints only. */
export function GseOccupationalAnalysis({
  companyId,
  workspaceId,
  disabled,
  onLocate,
}: {
  companyId: string;
  workspaceId: string;
  disabled: boolean;
  onLocate: (id: string) => void;
}) {
  const [result, setResult] = useState<Analysis | null>(null);
  const [diagnosis, setDiagnosis] =
    useState<ExposureGroupAssistantDiagnosisResponse | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [selected, setSelected] = useState<
    Analysis['proposals'][number] | null
  >(null);
  const generation = useRef(0);
  React.useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function analyze() {
    if (busy || disabled || !companyId || !workspaceId) return;
    const request = ++generation.current;
    setBusy(true);
    setError('');
    setResult(null);
    setDiagnosis(null);
    setSelected(null);
    try {
      const [proposals, diagnostic] = await Promise.all([
        runSimilarityProposals({ companyId, workspaceId, proposalMode: 'ALL' }),
        runExposureGroupDiagnosis({ companyId, workspaceId }),
      ]);
      if (request !== generation.current) return;
      if (
        diagnostic.workspace.companyId !== companyId ||
        diagnostic.workspace.id !== workspaceId
      )
        throw new Error('DIAGNOSIS_SCOPE_MISMATCH');
      setResult(adaptOccupationalAnalysis(proposals, companyId, workspaceId));
      setDiagnosis(diagnostic);
    } catch {
      if (request === generation.current)
        setError(
          'Não foi possível concluir a análise ocupacional. Confira suas permissões e tente novamente.',
        );
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }
  return (
    <Box sx={{ my: 1 }}>
      <Button
        size="small"
        disabled={disabled || busy || !workspaceId}
        onClick={analyze}
      >
        {busy
          ? 'Analisando dados ocupacionais…'
          : 'Auditoria ocupacional complementar'}
      </Button>
      <GseConsultativeInfo label="Sobre a auditoria ocupacional complementar">
        Reutiliza o diagnóstico e a similaridade existentes para confrontar
        GSEs, riscos, vínculos e caracterizações. Não é requisito para a
        formação inicial. Somente consulta, sem gravação.
      </GseConsultativeInfo>
      {error && <Alert severity="error">{error}</Alert>}
      {result && (
        <>
          <GseConsultativeInfo label="Sobre correspondência e materialização">
            Correspondência cadastral não certifica equivalência de exposição.
            Nenhuma proposta desta auditoria é enviada à gravação da V1.
            Reanalise após alterações.
          </GseConsultativeInfo>
          <Typography variant="body2">
            {result.proposals.length} proposta(s) ocupacional(is)
          </Typography>
          {!result.proposals.length && (
            <Typography variant="body2">
              Nenhuma proposta retornada. Consulte o diagnóstico e as limitações
              abaixo.
            </Typography>
          )}
          {result.proposals.map((proposal) => (
            <Box
              key={proposal.key}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: 1,
                my: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                {proposal.candidate.draft?.name ||
                  proposal.candidate.provisionalName}
              </Typography>
              <Typography variant="caption" display="block">
                Ocupacional · {recognitionLabel(proposal.recognition)}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {proposal.blocked && (
                  <Chip size="small" label="Bloqueada" color="error" />
                )}
                {proposal.insufficient && (
                  <Chip
                    size="small"
                    label="Dados insuficientes"
                    color="warning"
                  />
                )}
                {proposal.requiresTechnicalReview && (
                  <Chip
                    size="small"
                    label="Revisão técnica necessária"
                    color="warning"
                  />
                )}
                <Chip
                  size="small"
                  label={`Confiança: ${{ HIGH: 'alta', MEDIUM: 'moderada', LOW: 'baixa', NONE: 'não determinada' }[proposal.candidate.confidence]}`}
                />
              </Stack>
              <Button size="small" onClick={() => setSelected(proposal)}>
                Ver proposta
              </Button>
              {proposal.existingGroupId && (
                <Button
                  size="small"
                  onClick={() => onLocate(proposal.existingGroupId!)}
                >
                  Localizar GSE existente
                </Button>
              )}
            </Box>
          ))}
          <details>
            <summary>Diagnóstico, cobertura e limitações</summary>
            {diagnosis && (
              <>
                <Typography variant="body2">
                  Maturidade:{' '}
                  {
                    {
                      EMPTY: 'Inicial',
                      PARTIAL: 'Parcial',
                      MATURE: 'Mais completo',
                    }[diagnosis.maturity]
                  }
                  . Achados: {diagnosis.summary.totalFindings}. Insuficiências:{' '}
                  {diagnosis.summary.dataInsufficiencyCount}.
                </Typography>
                <Typography variant="body2">
                  {professionalGseText(diagnosis.narrative.opening)}
                </Typography>
                {diagnosis.narrative.recommendations.map((item) => (
                  <Box key={item.id} sx={{ my: 1 }}>
                    <Typography fontWeight={600}>
                      {professionalGseText(item.title)}
                    </Typography>
                    <Typography variant="body2">
                      {professionalGseText(item.situation)}
                    </Typography>
                    <Typography variant="body2">
                      {professionalGseText(item.whyAttention)}
                    </Typography>
                    <Typography variant="body2">
                      {professionalGseText(item.howToReview)}
                    </Typography>
                  </Box>
                ))}
                {diagnosis.limitations.map((item) => (
                  <Typography key={item.code} variant="body2">
                    {professionalGseText(item.message)}
                  </Typography>
                ))}
                {diagnosis.snapshotContentHash !==
                  result.response.snapshotContentHash && (
                  <Alert severity="warning">
                    Diagnóstico e propostas foram lidos em snapshots diferentes.
                    Reexecute a análise para conferir o estado atualizado.
                  </Alert>
                )}
              </>
            )}
            <Typography variant="body2">
              Elementos avaliados: {result.response.totals.elementsEvaluated}. A
              disponibilidade dos dados limita a conclusão técnica.
            </Typography>
          </details>
        </>
      )}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Detalhes da proposta ocupacional{' '}
          <Button onClick={() => setSelected(null)}>Fechar</Button>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <>
              <Alert severity="info">
                {recognitionLabel(selected.recognition)}. Reconhecimento
                cadastral não certifica equivalência ocupacional. Consulta sem
                aprovação ou gravação.
              </Alert>
              <Typography>
                {professionalGseText(
                  selected.candidate.draft?.description || '',
                )}
              </Typography>
              {Object.entries(
                occupationalTechnicalSections(selected.candidate),
              ).map(([title, values]) => (
                <Box key={title} sx={{ my: 1 }}>
                  <Typography fontWeight={600}>{title}</Typography>
                  {values.length ? (
                    values.map((v, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {professionalGseText(v)}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2">Não informado.</Typography>
                  )}
                </Box>
              ))}
              <details>
                <summary>
                  Composição, riscos, exposições, reconhecimento e
                  rastreabilidade completos
                </summary>
                <Typography variant="body2">
                  Cargos considerados:{' '}
                  {selected.candidate.draft?.includedJobs
                    .map((value) => professionalGseText(value))
                    .join(', ') || 'Não informados.'}
                </Typography>
                <Typography variant="body2">
                  Elementos de origem:{' '}
                  {selected.candidate.participants
                    .map((p) => professionalGseText(p.name))
                    .join(', ') || 'Não informados.'}
                </Typography>
                <Typography variant="body2">
                  Riscos considerados:{' '}
                  {selected.candidate.draft?.includedRisks.count ??
                    'Não informado'}
                  .
                </Typography>
                <Typography variant="body2">
                  {professionalGseText(
                    selected.candidate.draft?.occupationalContext ||
                      'Contexto ocupacional não informado.',
                  )}
                </Typography>
              </details>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
