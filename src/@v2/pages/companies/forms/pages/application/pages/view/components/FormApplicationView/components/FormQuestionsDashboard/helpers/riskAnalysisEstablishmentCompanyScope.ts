/**
 * Recorte operacional da Análise de Riscos por estabelecimento (formulário compartilhado).
 *
 * companyId do estabelecimento selecionado: vem de participantStructures[].companyId
 * (Employee.companyId dos participantes do único grupo visível) — identidade da unidade
 * do chip, não inferência pelos setores respondidos.
 *
 * Comparação operacional: entityMap[entityId].companyId (Hierarchy.companyId).
 * Nunca compara por nome de setor/estabelecimento.
 */

const STRUCTURAL_NON_ESTABLISHMENT_GROUPING_KEYS = new Set([
  '__participant_directory',
  '__participant_management',
  '__participant_sector',
  '__participant_sub_sector',
]);

export function isEstablishmentGroupingSelection(params: {
  selectedGroupingQuestionId: string | null | undefined;
  selectedGroupingLabel?: string | null;
}): boolean {
  const { selectedGroupingQuestionId, selectedGroupingLabel } = params;
  if (!selectedGroupingQuestionId) return false;

  if (selectedGroupingQuestionId === '__participant_workspace') {
    return true;
  }

  if (STRUCTURAL_NON_ESTABLISHMENT_GROUPING_KEYS.has(selectedGroupingQuestionId)) {
    return false;
  }

  const label = selectedGroupingLabel?.trim().toLowerCase() ?? '';
  return label.includes('estabelecimento');
}

/**
 * companyId do estabelecimento selecionado: único Employee.companyId entre os
 * participantes do único grupo visível. Ausência, nulos ou mais de um valor → null.
 */
export function resolveOperationalCompanyIdFromSelectedEstablishmentGroup(params: {
  visibleParticipantGroups: Array<{
    participantIds: Set<string> | string[];
  }>;
  participantStructures: Array<{
    participantsAnswersId: string;
    companyId?: string | null;
  }>;
}): string | null {
  if (params.visibleParticipantGroups.length !== 1) return null;

  const [group] = params.visibleParticipantGroups;
  if (!group) return null;

  const companyByParticipantId = new Map<string, string>();
  for (const structure of params.participantStructures) {
    const companyId = structure.companyId?.trim();
    if (!companyId) continue;
    companyByParticipantId.set(structure.participantsAnswersId, companyId);
  }

  const companyIds = new Set<string>();
  for (const participantId of group.participantIds) {
    const companyId = companyByParticipantId.get(participantId);
    if (companyId) companyIds.add(companyId);
  }

  if (companyIds.size !== 1) return null;
  return [...companyIds][0] ?? null;
}

export function shouldRestrictRiskAnalysisToEstablishmentCompany(params: {
  selectedGroupingQuestionId: string | null | undefined;
  selectedGroupingLabel?: string | null;
  allowedEntityIds: Set<string> | null;
  /** Quantidade de grupos de estabelecimento efetivamente visíveis no recorte. */
  visibleEstablishmentGroupCount?: number | null;
}): boolean {
  if (params.allowedEntityIds == null) return false;
  if (
    !isEstablishmentGroupingSelection({
      selectedGroupingQuestionId: params.selectedGroupingQuestionId,
      selectedGroupingLabel: params.selectedGroupingLabel,
    })
  ) {
    return false;
  }
  // Só recorta por companyId quando um estabelecimento específico está ativo.
  // Vários grupos visíveis = visão multiunidade; não restringe.
  return (params.visibleEstablishmentGroupCount ?? 0) === 1;
}

export function isEntityInEstablishmentCompanyScope(params: {
  entityId: string;
  entityMap: Record<string, { companyId?: string } | undefined>;
  scopeCompanyId: string | null;
  restrict: boolean;
}): boolean {
  if (!params.restrict || !params.scopeCompanyId) return true;
  const companyId = params.entityMap[params.entityId]?.companyId?.trim();
  if (!companyId) return false;
  return companyId === params.scopeCompanyId;
}
