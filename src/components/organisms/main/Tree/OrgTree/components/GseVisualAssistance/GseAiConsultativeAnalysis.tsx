import { gsePanelContrastSx } from './gse-review-theme';
import type { AiApprovedGseDraft } from './gse-ai-approved-draft';
import { consultativeObservations, consultativeDecisionStatements, consultativeBasis, previousFeedback, declarationSummary, feedbackKey, emptyFeedback, type ConsultativeFeedback } from './gse-consultative-interaction';
import { GseAiProposalCard } from './GseAiProposalCard';
import { GseConsultativeInfo } from './GseConsultativeInfo';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  analyzeGseWithAi,
  previewGseAiScope,
  AiGseScopePreview,
  aiConsultativeClientError,
  AiGseAnalysis,
  AiPreliminaryGroup,
  AiGseLocalReview,
  initialAiReview,
  aiClassificationLabel,
  aiRolePath,
  professionalGseText,
} from './gse-ai-consultative';

/** AI remains consultative; explicit approval may stage new groups for the separate save confirmation. */
export function GseAiConsultativeAnalysis({
  companyId,
  workspaceId,
  guidance,
  disabled,
  onLocate,
  preliminaryDistribution = [],
  onAnalysisPresence,
  sectors = [], roles = [], existingGroups = [],
  onStageProposal, savedProposalIds = [],
  registrySignature = '', onRefreshRegistry, onEditRole, canEditRole,
}: {
  onStageProposal?: (draft: AiApprovedGseDraft) => void;
  savedProposalIds?: string[];
  sectors?: { id: string; name: string }[];
  roles?: { id: string; name: string }[];
  existingGroups?: { id: string; name: string }[];
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
  const draftIds = useRef<Record<string, string>>({});
  const [analysisPurpose, setPurpose] = useState<'REVIEW_EXISTING' | 'FORM_NEW'>('FORM_NEW');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [existingGroupIds, setExistingGroupIds] = useState<string[]>([]);
  const [sectorMode, setSectorMode] = useState(false);
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [onlyUnlinkedRoles, setOnlyUnlinkedRoles] = useState(false);
  const [scopePreview, setScopePreview] = useState<AiGseScopePreview | null>(null);
  const [checkingScope, setCheckingScope] = useState(false);
  const scope = { analysisPurpose, roleIds, existingGroupIds: analysisPurpose === 'REVIEW_EXISTING' ? existingGroupIds : [], sectorIds: sectorMode ? sectorIds : [], onlyUnlinkedRoles };
  const scopeSignature = JSON.stringify(scope);
  React.useEffect(() => { setScopePreview(null); }, [scopeSignature, registrySignature]);
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
  const localSignature = JSON.stringify([guidance, observations, preliminaryDistribution.filter(g => !g.key.startsWith('@visual-gse:ai-')), scope]);
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
  async function checkScope() {
    if (sectorMode && !sectorIds.length) throw Error('GSE_SCOPE_SELECT_SECTOR');
    const result = await previewGseAiScope(companyId, workspaceId, scope);
    setScopePreview(result);
    if (!result.selectedRoles) throw Error('GSE_SCOPE_EMPTY');
    if (!result.fits) throw Error('GSE_SCOPE_TOO_LARGE');
    return result;
  }
  async function analyze() {
    if (busy || checkingScope || disabled || !workspaceId) return;
    const current = ++request.current;
    setBusy(true);
    setError('');
    try {
      await checkScope();
      const selectedStatements = analysis?.status === 'ANALYZED' && analysis.sources.analysisPurpose === analysisPurpose ? consultativeDecisionStatements(analysis, reviews) : [];
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
        scope,
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
  function draftId(id: string) {
    const key = `${analysis?.contextHash}:${analysis?.generatedAt}:${id}`;
    return draftIds.current[key] ||= `@visual-gse:ai-${crypto.randomUUID()}//${workspaceId}`;
  }
  function edit(id: string, patch: Partial<AiGseLocalReview>) {
    const proposal = analysis?.proposals.find(p => p.id === id);
    const next = { ...reviews[id], ...patch };
    if (patch.decision === 'accepted' && proposal && !proposal.existingGroupId) next.roles = Object.fromEntries(proposal.hierarchyIds.map(roleId => [roleId, next.roles[roleId] === 'rejected' ? 'rejected' : 'accepted']));
    if (proposal && !proposal.existingGroupId && (patch.decision !== undefined || next.decision === 'accepted')) {
      try {
        if (!onStageProposal || stale || disabled || busy) throw Error('A prévia de gravação não está disponível. Confira o escopo antes de aceitar.');
        const hierarchyIds = proposal.hierarchyIds.filter(roleId => next.roles[roleId] === 'accepted');
        onStageProposal({ id: draftId(id), name: next.name, description: next.description, hierarchyIds, decision: next.decision });
        setError('');
      } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível preparar a proposta para gravação.'); return; }
    }
    setReviews((prev) => ({ ...prev, [id]: next }));
  }
  const labelRole = (id: string) => (analysis ? aiRolePath(analysis, id) : id);
  return (
    <Box sx={{ ...gsePanelContrastSx, my: 1, borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
      <GseAiConsultativeHeading />
      <Box sx={{ my: 2 }}>
        <TextField select fullWidth size="small" label="Objetivo da análise" value={analysisPurpose}
          disabled={busy || checkingScope || disabled} onChange={e => { setPurpose(e.target.value as typeof analysisPurpose); setOnlyUnlinkedRoles(false); }} sx={{ my: 4 }}>
          <MenuItem value="FORM_NEW">Propor novos GSEs</MenuItem>
          <MenuItem value="REVIEW_EXISTING">Revisar GSEs existentes</MenuItem>
        </TextField>
        <Typography variant="caption" display="block" sx={{ mb: 4 }}>{analysisPurpose === 'FORM_NEW'
          ? 'Compara os cargos selecionados para propor grupos e subgrupos. Os GSEs existentes são referências; nenhuma criação é automática.'
          : 'Revisa a composição dos GSEs que abrangem o recorte. Grupos sem integrantes no recorte não geram cartões de diagnóstico.'}</Typography>
        {analysisPurpose === 'REVIEW_EXISTING' && <Autocomplete multiple size="small" options={existingGroups} getOptionLabel={g => g.name}
          isOptionEqualToValue={(a,b) => a.id === b.id} value={existingGroups.filter(g => existingGroupIds.includes(g.id))}
          onChange={(_, selected) => setExistingGroupIds(selected.map(g => g.id))} disabled={busy || checkingScope || disabled}
          renderInput={params => <TextField {...params} label="GSEs a revisar (opcional)" helperText="Sem seleção, considera os GSEs com cargos no recorte." />} sx={{ mb: 4 }} />}

        <FormControlLabel control={<Checkbox checked={sectorMode} disabled={busy || checkingScope || disabled} onChange={(_, checked) => setSectorMode(checked)} />} label="Selecionar setores para análise" />
        {sectorMode && <Autocomplete
          multiple size="small" options={sectors} getOptionLabel={(item) => item.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={sectors.filter((s) => sectorIds.includes(s.id))}
          onChange={(_, selected) => setSectorIds(selected.map((s) => s.id))}
          disabled={busy || checkingScope || disabled}
          renderInput={(params) => <TextField {...params} label="Setores incluídos" helperText="Inclui os cargos e subníveis dos setores selecionados." />}
        />}
        <Autocomplete multiple size="small" options={roles} getOptionLabel={r => r.name}
          isOptionEqualToValue={(a,b) => a.id === b.id} value={roles.filter(r => roleIds.includes(r.id))}
          onChange={(_, selected) => setRoleIds(selected.map(r => r.id))} disabled={busy || checkingScope || disabled}
          renderInput={params => <TextField {...params} label="Cargos incluídos (opcional)" helperText="Sem seleção, inclui todos os cargos dos setores escolhidos ou do estabelecimento. Os filtros são combinados." />} sx={{ my: 4 }} />
        <FormControlLabel control={<Checkbox checked={onlyUnlinkedRoles} disabled={busy || checkingScope || disabled} onChange={(_, checked) => setOnlyUnlinkedRoles(checked)} />} label="Analisar somente cargos sem vínculo com GSE" />
        <Typography variant="caption" display="block">Considera vínculos ativos e salvos, inclusive herdados. Sugestões ainda não salvas não excluem cargos. Os GSEs existentes permanecem como referência resumida; suas composições fora do recorte não serão revisadas.</Typography>
        <Button size="small" disabled={busy || checkingScope || disabled || !workspaceId} onClick={async () => {
          setCheckingScope(true); setError('');
          try { await checkScope(); } catch (e) { setError(aiConsultativeClientError(e)); } finally { setCheckingScope(false); }
        }}>{checkingScope ? 'Conferindo…' : 'Conferir escopo (sem usar IA)'}</Button>
        {scopePreview && <Alert severity={scopePreview.fits && scopePreview.selectedRoles ? 'info' : 'warning'}>
          Serão analisados {scopePreview.selectedRoles} cargos{sectorMode ? ` dos setores selecionados: ${sectors.filter(s => sectorIds.includes(s.id)).map(s => s.name).join(', ')}` : ' do recorte selecionado'}.
          {' '}{scopePreview.excludedLinkedRoles === 0
            ? 'Nenhum cargo desse recorte foi excluído por vínculo salvo com GSE.'
            : `${scopePreview.excludedLinkedRoles} cargos desse recorte foram excluídos por já possuírem vínculo salvo com GSE.`}
          {' '}{scopePreview.fits ? 'O contexto básico cabe no limite.' : 'O recorte excede o limite; selecione menos setores.'}
          {' '}Observações e prévia serão verificadas novamente antes da análise.
        </Alert>}
      </Box>
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
        disabled={disabled || busy || checkingScope || !workspaceId}
        onClick={analyze}
      >
        {busy ? 'Interpretando atividades…' : analysisPurpose === 'FORM_NEW' ? 'Propor novos GSEs com IA' : 'Revisar GSEs com IA'}
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
          {stale && <Typography variant="caption">Resultado anterior — não corresponde aos filtros ou ao objetivo atuais.</Typography>}
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
                  saved={savedProposalIds.includes(draftIds.current[`${analysis.contextHash}:${analysis.generatedAt}:${p.id}`])}
                  disabled={stale || disabled || busy || savedProposalIds.includes(draftIds.current[`${analysis.contextHash}:${analysis.generatedAt}:${p.id}`])}
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
