import { GseStructuringAlternatives, consultativeGroupSx } from './GseStructuringAlternatives';
import { operationalConclusion, professionalPositionLabels, type ProfessionalFeedback } from './gse-consultative-interaction';
import React from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import {
  AiGseAnalysis, AiGseProposal, AiGseLocalReview, AiRoleRecommendation,
  aiClassificationLabel, aiRolePath, professionalGseText, professionalSources,
  roleRecommendations, recommendationSummary, recommendationConclusion,
  recommendationDecisionLabel, requiresRecommendationDecision,
  aiGroupState, aiGroupCurrent, aiGroupPreview, aiGroupDestinations,
} from './gse-ai-consultative';
import { REVIEW_COLORS } from './gse-integrated-review.model';
import { GseConsultativeInfo } from './GseConsultativeInfo';

export function GseAiProposalCard({ proposal: p, analysis, review, disabled, onEdit, onLocate, feedback, feedbackDisabled, onFeedback, onEditRole, canEditRole, previousManifestation, onConfirmManifestation }: {
  proposal: AiGseProposal; analysis: AiGseAnalysis; review: AiGseLocalReview; disabled: boolean;
  previousManifestation?: boolean; onConfirmManifestation?: () => void;
  feedback?: ProfessionalFeedback; feedbackDisabled?: boolean;
  onFeedback?: (patch: Partial<ProfessionalFeedback>) => void;
  onEditRole?: (id: string, field: 'description' | 'realDescription') => void;
  canEditRole?: (id: string, field: 'description' | 'realDescription') => boolean;
  onEdit: (patch: Partial<AiGseLocalReview>) => void; onLocate: (id: string) => void;
}) {
  const clarificationRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const text = (v: string) => professionalGseText(v, analysis);
  const state = aiGroupState(p, review);
  const color = state === 'NEW' ? REVIEW_COLORS.newGroup : state === 'CHANGED' ? REVIEW_COLORS.changedGroup : REVIEW_COLORS.neutral;
  const identity = (analysis.sources.existingGroups as {id:string; name:string}[] | undefined)?.find((g) => g.id === p.existingGroupId);
  const counts = recommendationSummary(p);
  const current = aiGroupCurrent(p, analysis);
  const preview = aiGroupPreview(p, analysis, review);
  const sections: { conclusion: AiRoleRecommendation['conclusion']; title: string }[] = [
    { conclusion: 'KEEP', title: 'Cargos a manter' }, { conclusion: 'INCLUDE', title: 'Cargos a incluir' },
    { conclusion: 'REMOVE', title: 'Cargos a retirar' }, { conclusion: 'REVIEW', title: 'Vínculos que exigem revisão' },
    { conclusion: 'INSUFFICIENT', title: 'Dúvidas e informações insuficientes no GSE' },
  ];
  return <Box component="article" aria-label={`Análise consultiva do GSE: ${text(identity?.name || review.name)}`} sx={consultativeGroupSx} data-testid="ai-gse-proposal">
    <Box aria-label="Identificação do GSE analisado" sx={{ p: 1.5, color: color.color, bgcolor: color.background, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" fontWeight={700}>{state === 'NEW' ? 'NOVO GSE PROPOSTO' : state === 'CHANGED' ? 'GSE EXISTENTE COM ALTERAÇÕES PROPOSTAS' : 'GSE EXISTENTE'}</Typography>
      <Typography component="h3" variant="subtitle2" fontWeight={700} sx={{ my: 0.5, overflowWrap: 'anywhere' }}>{text(identity?.name || review.name)}</Typography>
      <Typography variant="body2"><strong>Situação consultiva: </strong>{state === 'NEW' ? 'Novo GSE proposto pela IA.' : state === 'CHANGED' || p.structuringAlternatives?.some((a) => a.kind !== 'MAINTAIN') ? 'Alterações propostas pela IA — sujeitas à revisão.' : 'Avaliação da composição existente — sem alteração aplicada.'}</Typography>
      <Typography variant="caption">{state === 'NEW' ? 'Grupo ainda não criado' : 'Identidade e vínculos atuais preservados'} · Proposta consultiva, não aplicada</Typography>
      {p.existingGroupId && <Button size="small" onClick={() => onLocate(p.existingGroupId!)}>Localizar GSE existente</Button>}
    </Box>
    <Box sx={{ p: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
    <Typography variant="caption">IA · {aiClassificationLabel(p.classification)}</Typography>
    <TextField fullWidth size="small" label="Nome proposto — revisão consultiva" value={text(review.name)} disabled={disabled} inputProps={{ maxLength: 160 }} onChange={(e) => onEdit({ name: e.target.value })} sx={{ my: 1 }} />
    <TextField fullWidth size="small" multiline minRows={3} maxRows={6} label="Descrição — revisão consultiva" value={text(review.description)} disabled={disabled} inputProps={{ maxLength: 4000 }} onChange={(e) => onEdit({ description: e.target.value })} sx={{ '& textarea': { fontSize: 11, lineHeight: 1.35 }, mb: 1 }} />
    <details open>
      <summary>Avaliação técnica do GSE</summary>
      <Typography variant="body2"><strong>Caracterização do grupo: </strong>{text(p.groupAssessment?.characterization || p.description)}</Typography>
      <Typography variant="body2"><strong>Condições de exposição: </strong>{text(p.groupAssessment?.exposureAssessment || 'Homogeneidade de exposição não confirmada. Revisão profissional necessária.')}</Typography>
      <Evidence title="Inconsistências na composição" values={(p.groupAssessment?.compositionInconsistencies || p.divergences).map(text)} />
      <Typography variant="body2"><strong>Distribuição preliminar: </strong>{text(p.groupAssessment?.preliminaryAssessment || 'Não avaliada nesta análise anterior. Reexecute para confrontar a prévia.')}</Typography>
      <Typography variant="caption">Vínculos atuais e propostas preliminares não são alterações aprovadas ou gravadas.</Typography>
    </details>
    <GseStructuringAlternatives proposal={p} analysis={analysis} disabled={disabled} />
    <Box sx={{ my: 1 }}>
      <Typography variant="body2" fontWeight={600}>Alterações propostas para este GSE</Typography>
      <Typography variant="body2">{counts.keep} manter · {counts.include} incluir · {counts.remove} retirar · {counts.review} revisar · {counts.insufficient} sem informação suficiente.</Typography>
      <Typography variant="caption">Nenhuma recomendação confirma automaticamente equivalência de exposição.</Typography>
    </Box>
    <details>
      <summary>Fundamentação técnica do grupo</summary>
      <details><summary>Ver justificativa técnica</summary><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{text(p.justification)}</Typography></details>
      {(['informationUsed','divergences','hypotheses','missingInformation','questions'] as const).map((key,i) => <Evidence key={key} title={['Informações consideradas','Divergências identificadas','Hipóteses da análise','Informações insuficientes','Esclarecimentos necessários'][i]} values={p[key].map(text)} />)}
      <Evidence title="Confirmações recomendadas em campo" values={[text(p.fieldConfirmation)]} />
      <Evidence title="Fontes fornecidas à IA" values={professionalSources(analysis)} />
      {p.groupAssessment?.alternatives.map((a) => <Box key={a.groupId} sx={{ my: 1 }}>
        <Typography variant="body2"><strong>Alternativa existente: </strong>{text((analysis.sources.existingGroups as {id:string; name:string}[] | undefined)?.find((g) => g.id === a.groupId)?.name || 'GSE existente')} — {({ SUITABLE: 'Potencialmente adequado', UNSUITABLE: 'Inadequação fundamentada', INSUFFICIENT: 'Informação insuficiente' })[a.assessment]}</Typography>
        <Typography variant="body2">{text(a.reason)}</Typography><Evidence title="Evidências da comparação" values={a.evidence.map(text)} />
      </Box>)}
      {p.groupAssessment?.newGroupJustification && <Typography variant="body2"><strong>Por que criar um novo GSE: </strong>{text(p.groupAssessment.newGroupJustification)}</Typography>}
    </details>
    <Box sx={{ my: 1 }} aria-label="Conclusão operacional do GSE">
      <Typography variant="body2" fontWeight={600}>Conclusão operacional</Typography>
      {operationalConclusion(p).map((line) => <Typography key={line} variant="body2">{line}</Typography>)}
      <Typography variant="caption">Conclusão da IA: não representa decisão aplicada pelo profissional.</Typography>
    </Box>
    {feedback && onFeedback && <Box sx={{ my: 1, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="body2" fontWeight={600}>Posição e esclarecimentos do profissional</Typography>
      {previousManifestation && <Alert severity="warning"><strong>Manifestação anterior — requer confirmação.</strong> Esta justificativa foi registrada antes da atualização dos dados considerados na análise, ou sua base anterior não está identificada. Verifique se permanece válida. O texto foi preservado e não constitui decisão atual.
        <Button size="small" disabled={feedbackDisabled ?? disabled} onClick={onConfirmManifestation}>Confirmar validade nesta sessão</Button>
      </Alert>}
      <Typography variant="caption">Somente nesta sessão. A conclusão e as ressalvas da IA permanecem preservadas. Nenhuma decisão formal foi registrada no GSE.</Typography>
      <TextField fullWidth multiline minRows={2} maxRows={5} size="small" label="Justificativa técnica do profissional" value={feedback.justification} disabled={feedbackDisabled ?? disabled} inputProps={{maxLength:2000}} onChange={(e)=>onFeedback({justification:e.target.value})} sx={{my:1}} />
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {(['agree','disagree',...(p.existingGroupId ? ['maintain'] : []),'review','pending'] as const).map((position) => <Button key={position} size="small" variant={feedback.position===position?'outlined':'text'} disabled={(feedbackDisabled ?? disabled) || (['disagree','maintain'].includes(position) && !feedback.justification.trim())} onClick={()=>onFeedback({position:position as ProfessionalFeedback['position']})}>
          {({agree:'Concordar com a orientação',disagree:'Discordar com justificativa',maintain:'Manter composição atual (consultivo)',review:'Solicitar revisão',pending:'Limpar posição'} as Record<string,string>)[position]}
        </Button>)}
      </Stack>
      <Typography variant="caption">{professionalPositionLabels[feedback.position]}. Discordância e manutenção exigem justificativa; nada altera os vínculos.</Typography>
      <TextField inputRef={clarificationRef} fullWidth multiline minRows={2} maxRows={6} size="small" label="Esclarecimentos para uma nova avaliação" value={feedback.clarification} disabled={feedbackDisabled ?? disabled} inputProps={{maxLength:4000}} onChange={(e)=>onFeedback({clarification:e.target.value})} sx={{mt:1}} />
      <Typography variant="caption">Declaração do profissional, sem comprovação automática de exposição. Use Reanalisar com IA para submetê-la junto aos cadastros atualizados.</Typography>
    </Box>}
    <GseConsultativeInfo label="Significado da avaliação consultiva">Aceitar significa concordar com uma orientação técnica. Não inclui, exclui ou altera vínculos. A gravação convencional exige sua confirmação própria. Rejeitar descarta somente a recomendação temporária.</GseConsultativeInfo>
    {sections.map(({ conclusion, title }) => {
      const list = roleRecommendations(p).filter((r) => r.conclusion === conclusion);
      return list.length ? <details key={conclusion}><summary>{title} ({list.length})</summary>{list.map((r) => {
        const decision = review.roles[r.hierarchyId] || 'pending';
        const destinations = aiGroupDestinations(analysis, p, r.hierarchyId);
        return <Box key={r.hierarchyId} sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1 }}>
          <Typography variant="body2" fontWeight={600}>{text(aiRolePath(analysis, r.hierarchyId))}</Typography>
          <Typography variant="body2"><strong>Situação: </strong>{r.existingInTarget ? 'Vínculo existente' : 'Cargo não vinculado ao GSE analisado'}. <strong>Conclusão: </strong>{recommendationConclusion[r.conclusion]}.</Typography>
          <Typography variant="body2"><strong>Origem atual: </strong>{r.currentGroups.length ? r.currentGroups.map((g) => text(g.name)).join(', ') : 'Nenhum GSE atual informado'}.</Typography>
          {r.conclusion === 'INCLUDE' && <Typography variant="body2"><strong>Destino proposto: </strong>{text(review.name)}. Não implica retirada dos grupos de origem.</Typography>}
          {r.conclusion === 'REMOVE' && <Typography variant="body2">Destino em outras propostas: {destinations.length ? destinations.map((g) => text(g.name)).join(', ') : 'Ainda não definido; avaliar as alternativas e lacunas do grupo'}. Inclusões e retiradas exigem decisões separadas.</Typography>}
          <Typography variant="body2">{text(r.recommendation)}</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {onEditRole && canEditRole?.(r.hierarchyId, 'description') && <Button disabled={feedbackDisabled ?? disabled} size="small" onClick={()=>onEditRole(r.hierarchyId,'description')}>Complementar descrição do cargo</Button>}
            {onEditRole && canEditRole?.(r.hierarchyId, 'realDescription') && <Button disabled={feedbackDisabled ?? disabled} size="small" onClick={()=>onEditRole(r.hierarchyId,'realDescription')}>Registrar ou complementar entrevista</Button>}
            {onFeedback && feedback && <Button disabled={feedbackDisabled ?? disabled} size="small" onClick={()=>{ if (!feedback.clarification.trim()) onFeedback({clarification:`Sobre ${aiRolePath(analysis,r.hierarchyId)}: `}); clarificationRef.current?.focus(); clarificationRef.current?.scrollIntoView?.({block:'nearest'}); }}>Prestar esclarecimentos sobre este cargo</Button>}
          </Stack>
          <details><summary>Ver fundamentos da recomendação</summary>
            <Typography variant="body2">{text(r.justification)}</Typography>
            <Evidence title="Evidências utilizadas" values={r.evidence.map(text)} />
            <Evidence title="Divergências identificadas" values={r.divergences.map(text)} />
            <Evidence title="Informações insuficientes" values={r.missingInformation.map(text)} />
            <Evidence title="Esclarecimentos necessários" values={r.questions.map(text)} />
          </details>
          {requiresRecommendationDecision(r) && <><Typography variant="body2">{recommendationDecisionLabel[decision]}</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {(decision === 'pending' ? ['accepted','rejected'] : ['pending']).map((next) => <Button key={next} size="small" disabled={disabled} onClick={() => onEdit({ roles: { ...review.roles, [r.hierarchyId]: next as 'accepted' | 'rejected' | 'pending' } })}>{next === 'accepted' ? 'Aceitar recomendação' : next === 'rejected' ? 'Rejeitar recomendação' : 'Reabrir decisão'}</Button>)}
            </Stack></>}
        </Box>;
      })}</details> : null;
    })}
    <details><summary>Prévia das decisões consultivas</summary>
      <Evidence title="Composição atual gravada" values={current.map((id) => text(aiRolePath(analysis, id)))} />
      <Evidence title="Composição após recomendações aceitas nesta sessão" values={preview.map((id) => text(aiRolePath(analysis, id)))} />
      <Typography variant="caption">Prévia local: nada foi gravado. Pendências, rejeições e informações insuficientes não alteram a composição.</Typography>
    </details>
    {state === 'NEW' && <Box sx={{ mt: 1 }}><Typography variant="body2">Criação consultiva: {recommendationDecisionLabel[review.decision]}</Typography><Stack direction="row" gap={1}>{(review.decision === 'pending' ? ['accepted','rejected'] : ['pending']).map((next) => <Button key={next} disabled={disabled} size="small" onClick={() => onEdit({ decision: next as 'accepted'|'rejected'|'pending' })}>{next === 'accepted' ? 'Aceitar proposta de novo GSE' : next === 'rejected' ? 'Rejeitar proposta de novo GSE' : 'Reabrir proposta'}</Button>)}</Stack></Box>}
    </Box>
  </Box>;
}
export function Evidence({ title, values }: { title: string; values: string[] }) {
  return <details><summary>{title}</summary>{values.length ? values.map((value,i) => <Typography variant="body2" key={i} sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>) : <Typography variant="body2">Não informado; não significa ausência comprovada.</Typography>}</details>;
}
