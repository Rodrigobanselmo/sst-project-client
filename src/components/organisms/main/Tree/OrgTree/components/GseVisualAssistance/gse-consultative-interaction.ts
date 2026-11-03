import type { AiGseAnalysis, AiGseProposal, AiGseLocalReview } from './gse-ai-consultative';
import { recommendationSummary } from './gse-ai-consultative';

export type ProfessionalPosition = 'pending' | 'agree' | 'disagree' | 'maintain' | 'review';
export type ProfessionalFeedback = {
  groupName: string; existingGroupId: string | null;
  basisSignature?: string;
  position: ProfessionalPosition; justification: string; clarification: string;
};
export type ConsultativeFeedback = Record<string, ProfessionalFeedback>;
export const feedbackKey = (p: AiGseProposal) => p.existingGroupId ? `existing:${p.existingGroupId}` : `temporary:${p.id}`;
export const emptyFeedback = (p: AiGseProposal): ProfessionalFeedback => ({ groupName: p.name, existingGroupId: p.existingGroupId, position: 'pending', justification: '', clarification: '' });
export const professionalPositionLabels: Record<ProfessionalPosition, string> = {
  pending: 'Sem posição informada', agree: 'Concordância consultiva', disagree: 'Discordância justificada',
  maintain: 'Manutenção proposta pelo profissional', review: 'Revisão solicitada',
};
/** These are user statements, not approved operations or confirmed exposure evidence. */
export function consultativeObservations(observations: string, feedback: ConsultativeFeedback, selectedRecommendations: string[] = [], analysis?: AiGseAnalysis) {
  const entries = Object.entries(feedback).filter(([, f]) => f.position !== 'pending' || f.justification.trim() || f.clarification.trim());
  if (entries.some(([, f]) => ['disagree', 'maintain'].includes(f.position) && !f.justification.trim())) throw Error('Informe a justificativa técnica para discordar ou propor manutenção.');
  const declarations = entries.map(([key, f]) => ({
    referenciaConsultiva: key, gseExistente: f.existingGroupId, nomeDoGrupoNaAvaliacao: f.groupName,
    situacaoDaManifestacao: analysis && previousFeedback(f,analysis) ? 'Manifestação anterior, requer confirmação. Reavaliar perante os cadastros atualizados; não é decisão atual.' : 'Declaração consultiva, sem aprovação formal ou comprovação de exposição.',
    posicaoDoProfissional: professionalPositionLabels[f.position], justificativa: f.justification.trim(), esclarecimento: f.clarification.trim(),
  }));
  const text = declarations.length || selectedRecommendations.length ? `${observations.trim()}\n\nDECLARAÇÕES TEMPORÁRIAS DO PROFISSIONAL PARA REANÁLISE. Não são evidências ocupacionais confirmadas, vínculos gravados ou comprovação de homogeneidade. Confronte com os cadastros atuais e preserve ressalvas técnicas. Referências temporárias não são IDs de GSE cadastrado.\n${JSON.stringify({declaracoes:declarations, posicoesConsultivasSobreRecomendacoesAnteriores:selectedRecommendations})}`.trim() : observations;
  if (text.length > 10000) throw Error('Os esclarecimentos excedem o limite desta análise. Resuma-os antes de reanalisar; nenhum texto foi truncado.');
  return text;
}
export function operationalConclusion(p: AiGseProposal): string[] {
  const n = recommendationSummary(p), lines: string[] = [];
  if (n.insufficient || p.missingInformation.length) lines.push('Complementar as informações indicadas antes de concluir sobre as exposições.');
  if (n.review || n.remove) lines.push('Revisar a composição do GSE; retiradas e destinos exigem decisão técnica explícita.');
  if (p.existingGroupId && n.include) lines.push('Avaliar a inclusão dos cargos indicados neste GSE, sem retirada automática da origem.');
  if (!p.existingGroupId && n.include) lines.push('Possibilidade fundamentada de novo GSE, condicionada à revisão profissional das alternativas.');
  if (n.keep && !n.review && !n.remove && !n.include) lines.push('Manutenção dos vínculos avaliados recomendada pela IA, preservadas as ressalvas e confirmações de campo.');
  if (!p.recommendations?.length) lines.push('Confirmar a composição do GSE; não foram avaliados cargos diretamente vinculados neste escopo.');
  return lines;
}
/** Stable relevant registry facts only; UI selection, drag/zoom and expansion are excluded. */
export function registrySignature(hierarchies: Record<string, any>, groups: any[], companyId: string, workspaceId: string) {
  return JSON.stringify([
    Object.values(hierarchies).filter((h) => h.companyId === companyId && h.workspaceIds?.includes(workspaceId))
      .map((h) => [h.id, h.name, h.description || '', h.realDescription || '', h.parentId, h.status, h.type]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
    groups.map((g) => [g.id, g.name, g.description, g.status, (g.hierarchies || []).map((h: any) => h.id).sort(), (g.hierarchyOnHomogeneous || []).map((h: any) => [h.id,h.hierarchyId,h.startDate,h.endDate,h.deletedAt]).sort((a: any[],b: any[])=>String(a[0]).localeCompare(String(b[0])))]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),
  ]);
}

export function declarationSummary(observations: string, feedback: ConsultativeFeedback) {
  return [observations.trim(), ...Object.values(feedback).filter((f)=>f.position!=='pending'||f.justification.trim()||f.clarification.trim()).map((f)=>
    `${f.groupName} — ${professionalPositionLabels[f.position]}.\nJustificativa: ${f.justification || 'Não informada'}.\nEsclarecimento: ${f.clarification || 'Não informado'}.`)].filter(Boolean).join('\n\n');
}

/** Previous selections are statements for reanalysis, never approvals of its new output. */
export function consultativeDecisionStatements(analysis: AiGseAnalysis, reviews: Record<string, AiGseLocalReview>): string[] {
  return analysis.proposals.flatMap((p) => {
    const review = reviews[p.id]; if (!review) return [];
    const selected = Object.entries(review.roles).filter(([, decision]) => decision !== 'pending')
      .map(([id, decision]) => `${p.name}: ${analysis.sources.roles.find((r) => r.id === id)?.name || 'Cargo da análise anterior'} — ${decision === 'accepted' ? 'concordância consultiva' : 'discordância consultiva'} com a recomendação anterior.`);
    if (!p.existingGroupId && review.decision !== 'pending') selected.push(`${p.name}: ${review.decision === 'accepted' ? 'concordância consultiva' : 'discordância consultiva'} com a proposta anterior de criação, sem aplicação ou aprovação formal.`);
    return selected;
  });
}

/** Registry basis excludes ephemeral declarations, so submitting a note does not invalidate itself. */
export function consultativeBasis(analysis: AiGseAnalysis): string {
  return JSON.stringify([analysis.companyId,analysis.workspaceId,analysis.sources.roles,analysis.sources.structure,
    analysis.sources.existingGroups,analysis.sources.characterizations,analysis.sources.occupationalRisks,
    analysis.proposals?.map((p)=>[p.existingGroupId,p.hierarchyIds,p.recommendations?.map((r)=>[r.hierarchyId,r.conclusion])])]);
}
export function previousFeedback(feedback: ProfessionalFeedback, analysis: AiGseAnalysis): boolean {
  return !!(feedback.position!=='pending'||feedback.justification.trim()||feedback.clarification.trim()) && feedback.basisSignature!==consultativeBasis(analysis);
}
