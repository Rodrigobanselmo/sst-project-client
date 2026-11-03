import { consultativeObservations, consultativeDecisionStatements, consultativeBasis, previousFeedback, declarationSummary, feedbackKey, emptyFeedback, type ConsultativeFeedback } from './gse-consultative-interaction';
import { GseAiProposalCard } from './GseAiProposalCard';
import { GseConsultativeInfo } from './GseConsultativeInfo';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  analyzeGseWithAi,
  aiConsultativeClientError,
  AiGseAnalysis,
  AiPreliminaryGroup,
  AiGseLocalReview,
  initialAiReview,
  aiClassificationLabel,
  aiRolePath,
  professionalGseText,
} from './gse-ai-consultative';

/** Same visual panel; review is ephemeral and intentionally cannot enter V1 persistence. */
export function GseAiConsultativeAnalysis({
  companyId,
  workspaceId,
  guidance,
  disabled,
  onLocate,
  preliminaryDistribution = [],
  onAnalysisPresence,
  registrySignature = '', onRefreshRegistry, onEditRole, canEditRole,
}: {
  registrySignature?: string;
  onRefreshRegistry?: () => Promise<string>;
  onEditRole?: (id: string, field: 'description' | 'realDescription') => void;
  canEditRole?: (id: string, field: 'description' | 'realDescription') => boolean;
  preliminaryDistribution?: AiPreliminaryGroup[];
  onAnalysisPresence?: (present: boolean) => void;
  companyId: string;
  workspaceId: string;
  guidance: string;
  disabled: boolean;
  onLocate: (id: string) => void;
}) {
  const [observations, setObservations] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<AiGseAnalysis | null>(null),
    [reviews, setReviews] = useState<Record<string, AiGseLocalReview>>({});
  const [inputAtAnalysis, setInputAtAnalysis] = useState('');
  const [registryAtAnalysis, setRegistryAtAnalysis] = useState('');
  const [feedback, setFeedback] = useState<ConsultativeFeedback>({});
  const [submittedDeclarations, setSubmittedDeclarations] = useState('');
  const [declarationsAtAnalysis, setDeclarationsAtAnalysis] = useState('');
  const declarationSignature = JSON.stringify(feedback);
  const localSignature = JSON.stringify([guidance, observations, preliminaryDistribution]);
  const request = useRef(0);
  React.useEffect(
    () => () => {
      request.current++;
      onAnalysisPresence?.(false);
    },
    [],
  );
  const stale =
    !!analysis && (inputAtAnalysis !== localSignature || registryAtAnalysis !== registrySignature);
  async function analyze() {
    if (busy || disabled || !workspaceId) return;
    const current = ++request.current;
    setBusy(true);
    setError('');
    try {
      const selectedStatements = analysis?.status === 'ANALYZED' ? consultativeDecisionStatements(analysis, reviews) : [];
      const declarations = consultativeObservations(observations, feedback, selectedStatements, analysis || undefined);
      const declarationsSnapshot = declarationSignature;
      const inputSnapshot = localSignature;
      const freshRegistry = onRefreshRegistry ? await onRefreshRegistry() : registrySignature;

      const result = await analyzeGseWithAi(
        companyId,
        workspaceId,
        guidance,
        declarations,
        preliminaryDistribution,
      );
      if (current !== request.current) return;
      const nextReviews = Object.fromEntries(
        (result.status === 'ANALYZED' ? result.proposals : []).map((p) => [
          p.id,
          initialAiReview(p),
        ]),
      );
      setAnalysis(result);
      onAnalysisPresence?.(result.status === 'ANALYZED');
      setInputAtAnalysis(inputSnapshot);
      setRegistryAtAnalysis(freshRegistry);
      setSubmittedDeclarations([declarationSummary(observations, feedback), ...selectedStatements].filter(Boolean).join('\n\n'));
      setDeclarationsAtAnalysis(declarationsSnapshot);
      setReviews(nextReviews);
    } catch (error) {
      if (current === request.current)
        setError(error instanceof Error && /justificativa técnica|esclarecimentos excedem|atualizar os dados cadastrais/.test(error.message) ? error.message : aiConsultativeClientError(error));
    } finally {
      if (current === request.current) setBusy(false);
    }
  }
  function edit(id: string, patch: Partial<AiGseLocalReview>) {
    setReviews((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }
  const labelRole = (id: string) => (analysis ? aiRolePath(analysis, id) : id);
  return (
    <Box sx={{ my: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
      <GseAiConsultativeHeading />
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={5}
        size="small"
        label="Observações do profissional — somente nesta análise"
        value={observations}
        disabled={busy || disabled}
        inputProps={{ maxLength: 10000 }}
        onChange={(e) => setObservations(e.target.value)}
        sx={{ my: 1 }}
      />
      <Button
        variant="contained"
        size="small"
        disabled={disabled || busy || !workspaceId}
        onClick={analyze}
      >
        {busy ? 'Interpretando atividades…' : analysis ? 'Reanalisar com IA' : 'Analisar com IA'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      {analysis?.status === 'UNAVAILABLE' && (
        <Alert severity="warning">
          {professionalGseText(analysis.reason || 'Análise indisponível.')} Sem
          substituição automática da análise. Use explicitamente Analisar estrutura ou a
          análise ocupacional complementar.
        </Alert>
      )}
      {!!analysis && declarationsAtAnalysis !== declarationSignature && <Alert severity="info">Há declarações do profissional ainda não consideradas pela IA. Elas permanecem temporárias; solicite reanálise quando desejar.</Alert>}
      {stale && (
        <Alert severity="warning">
          Análise desatualizada: dados cadastrais, distribuição preliminar ou declarações do profissional foram alterados. O resultado anterior foi preservado para consulta. Solicite Reanalisar com IA quando concluir os ajustes; nenhuma nova análise é automática.
        </Alert>
      )}
      {analysis?.status === 'ANALYZED' && (
        <>
          <GseConsultativeInfo label="Natureza das propostas consultivas">
            Nenhuma classificação comprova automaticamente homogeneidade de
            exposição. Recomendações exigem avaliação profissional e confirmação
            em campo. Reanalise após mudanças nos dados. O botão Confirmar e salvar atende às propostas estruturais do painel; ele não aplica as decisões desta seção nem registra histórico de GSE.
          </GseConsultativeInfo>
          {submittedDeclarations && <details><summary>Declarações consideradas nesta avaliação</summary><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{professionalGseText(submittedDeclarations, analysis)}</Typography><Typography variant="caption">Declarações do profissional não comprovam automaticamente homogeneidade de exposição.</Typography></details>}
          {analysis.proposals.length === 0 && (
            <Typography variant="body2">
              Nenhum agrupamento proposto. Verifique as perguntas e situações de
              não agrupamento.
            </Typography>
          )}
          {analysis.proposals.map(
            (p) =>
              reviews[p.id] && (
                <GseAiProposalCard
                  key={p.id}
                  proposal={p}
                  analysis={analysis}
                  review={reviews[p.id]}
                  disabled={stale || disabled || busy}
                  feedbackDisabled={disabled || busy}
                  feedback={feedback[feedbackKey(p)] || emptyFeedback(p)}
                  previousManifestation={!!feedback[feedbackKey(p)] && previousFeedback(feedback[feedbackKey(p)],analysis)}
                  onConfirmManifestation={() => {
                    const key=feedbackKey(p);
                    setFeedback((prev)=>prev[key]?{...prev,[key]:{...prev[key],basisSignature:consultativeBasis(analysis)}}:prev);
                  }}
                  onFeedback={(patch) => {
                    const key = feedbackKey(p);
                    setFeedback((prev) => ({ ...prev, [key]: { ...(prev[key] || { ...emptyFeedback(p), basisSignature: consultativeBasis(analysis) }), ...patch } }));
                    if (patch.position === 'maintain') edit(p.id, { roles: Object.fromEntries(Object.keys(reviews[p.id].roles).map((id) => [id, 'rejected' as const])) });
                  }}
                  onEditRole={onEditRole ? (id, field) => { onEditRole(id, field); } : undefined}
                  canEditRole={canEditRole}
                  onEdit={(patch) => edit(p.id, patch)}
                  onLocate={onLocate}
                />
              ),
          )}
          {analysis.doNotGroup.map((item, i) => (
            <Alert severity="warning" key={i}>
              Não agrupar sem revisão:{' '}
              {item.hierarchyIds.map(labelRole).join(', ')}.{' '}
              {professionalGseText(item.reason, analysis)}
            </Alert>
          ))}
          {analysis.questions.map((question, i) => (
            <Typography variant="body2" key={i}>
              Esclarecimento: {professionalGseText(question, analysis)}
            </Typography>
          ))}
        </>
      )}
    </Box>
  );
}

/** The title and its existing accessible tooltip share a single non-wrapping row. */
export function GseAiConsultativeHeading() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.25}
      flexWrap="nowrap"
      data-gse-ai-heading
    >
      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 0 }}>
        Análise consultiva por IA
      </Typography>
      <Box sx={{ flexShrink: 0 }}>
        <GseConsultativeInfo label="Sobre a análise por IA">
          Interpreta estrutura, atividades, descrições, entrevistas e
          orientações. Não exige riscos cadastrados. Recomendações são
          temporárias e não executam alterações.
        </GseConsultativeInfo>
      </Box>
    </Stack>
  );
}
