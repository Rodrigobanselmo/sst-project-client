export type RiskDeclarationDraft = {
  exposure: string;
  scope: string;
  assessmentType: string;
  epiUsed: string;
  epcPresent: string;
  justification: string;
  agentDescription: string;
  notes: string;
  judicialProcess: string;
};
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown) => (typeof value === 'string' ? value : '');

export function readRiskDeclaration(json: unknown): RiskDeclarationDraft {
  const source = object(json),
    declaration = object(source.sstDeclaration);
  return {
    exposure: text(declaration.exposure) || 'NOT_INFORMED',
    scope: text(declaration.scope),
    assessmentType: text(source.assessmentType),
    epiUsed: text(declaration.epiUsed) || 'NOT_INFORMED',
    epcPresent: text(declaration.epcPresent) || 'NOT_INFORMED',
    justification: text(declaration.justification),
    agentDescription: text(declaration.agentDescription),
    notes: text(declaration.notes),
    judicialProcess: text(declaration.judicialProcess),
  };
}

export function riskDeclarationError(
  draft: RiskDeclarationDraft,
  epiCount = 0,
  epcCount = 0,
) {
  if (
    (draft.exposure === 'ABSENT' || draft.scope === 'OUT_OF_SCOPE') &&
    !draft.justification.trim()
  )
    return 'Justifique a ausência de exposição ou o não enquadramento deste risco.';
  if (epiCount > 0 && draft.epiUsed !== 'YES')
    return 'Há EPIs vinculados à avaliação. Confirme que são utilizados ou ajuste os equipamentos no cadastro.';
  if (epcCount > 0 && draft.epcPresent !== 'YES')
    return 'Há EPCs vinculados à avaliação. Confirme sua presença ou ajuste os equipamentos no cadastro.';
  if (draft.agentDescription.trim().length > 100)
    return 'A descrição do agente deve ter até 100 caracteres.';
  if (draft.notes.trim().length > 999)
    return 'As observações devem ter até 999 caracteres.';
  if (draft.justification.trim().length > 10000)
    return 'A justificativa deve ter até 10.000 caracteres.';
  if (
    draft.judicialProcess.trim() &&
    !/^(?:\d{17}|\d{20}|\d{21})$/.test(draft.judicialProcess.trim())
  )
    return 'Informe o número do processo judicial somente com dígitos: 17, 20 ou 21 caracteres.';
  return '';
}

export function riskDeclarationJson(
  json: unknown,
  draft: RiskDeclarationDraft,
) {
  const source = { ...object(json) },
    declaration = { ...object(source.sstDeclaration) };
  for (const field of [
    'exposure',
    'scope',
    'epiUsed',
    'epcPresent',
    'justification',
    'agentDescription',
    'notes',
    'judicialProcess',
  ] as const) {
    const value = draft[field].trim();
    if (value) declaration[field] = value;
    else delete declaration[field];
  }
  source.sstDeclaration = declaration;
  if (draft.assessmentType) source.assessmentType = draft.assessmentType;
  else delete source.assessmentType;
  return source;
}
