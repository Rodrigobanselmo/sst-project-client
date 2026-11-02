export type CatalogIntent = 'CORRECTION' | 'NEW_CONDITION';
export type CatalogAssessment = {
  id: string;
  riskName: string;
  sourceName: string;
  startDate: string | null;
  endDate: string | null;
  workerCount: number;
  protectedWorkerCount: number;
  hasDeliveryInProgress: boolean;
  reviewIssue?: string;
};
export type CatalogPreview = {
  contractVersion: 1;
  expectedHead: string;
  impactHash: string;
  target: { table: 'RiskFactors' | 'RecMed' | 'Epi'; id: string };
  catalogName: string;
  mode: 'CATALOG_AND_USES' | 'COMPANY_USES_ONLY';
  changes: { field: string; before: unknown; after: unknown }[];
  assessments: CatalogAssessment[];
  summary: { totalAssessments: number; totalWorkers: number };
  limits: { selection: number };
};
export type CatalogDecision = {
  intent: CatalogIntent;
  effectiveFrom: string;
  reason: string;
  assessmentIds: string[];
};

export function catalogAssessmentIssue(
  assessment: CatalogAssessment,
  intent: CatalogIntent | '',
  effectiveFrom: string,
): string | undefined {
  if (assessment.reviewIssue) return assessment.reviewIssue;
  if (assessment.hasDeliveryInProgress)
    return 'Há um envio em processamento ou com resultado ainda não confirmado.';
  if (!assessment.startDate)
    return 'Esta avaliação precisa de uma data inicial no cadastro de origem.';
  if (!intent || !effectiveFrom) return undefined;
  const start = assessment.startDate.slice(0, 10);
  const end = assessment.endDate?.slice(0, 10);
  if (intent === 'NEW_CONDITION' && effectiveFrom <= start)
    return 'A nova condição deve começar depois do início deste período.';
  if (intent === 'CORRECTION' && effectiveFrom < start)
    return 'Escolha uma data dentro deste período para corrigi-lo.';
  if (end && effectiveFrom >= end)
    return 'A data deve ser anterior ao fim deste período.';
  return undefined;
}

export function catalogSelectionIssue(
  preview: CatalogPreview,
  selected: string[],
  intent: CatalogIntent | '',
  effectiveFrom: string,
): string | undefined {
  if (!selected.length) return 'Selecione pelo menos uma avaliação.';
  if (selected.length > preview.limits.selection)
    return `Selecione até ${preview.limits.selection} avaliações por alteração.`;
  for (const id of selected) {
    const assessment = preview.assessments.find((row) => row.id === id);
    if (!assessment) return 'A seleção mudou. Confira novamente os cadastros.';
    const issue = catalogAssessmentIssue(assessment, intent, effectiveFrom);
    if (issue) return issue;
  }
  return undefined;
}

const catalogEnumLabels: Record<string, Record<string, string>> = {
  type: {
    BIO: 'Biológico',
    QUI: 'Químico',
    FIS: 'Físico',
    ERG: 'Ergonômico',
    ACI: 'Acidente',
    OUTROS: 'Outros',
  },
  medType: { ADM: 'Administrativa', ENG: 'Engenharia / proteção coletiva' },
  recType: {
    ADM: 'Administrativa',
    ENG: 'Engenharia / proteção coletiva',
    EPI: 'Proteção individual',
  },
  grauInsalubridade: { MIN: 'Mínimo', MED: 'Médio', MAX: 'Máximo' },
  status: {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    PROGRESS: 'Em andamento',
    PENDING: 'Pendente',
    CANCELED: 'Cancelado',
    PROCESSING: 'Em processamento',
    EXPIRED: 'Vencido',
    VALID: 'Válido',
    INVALID: 'Inválido',
    ERROR: 'Erro',
    DONE: 'Concluído',
    MODIFIED: 'Alterado',
    TRANSMITTED: 'Transmitido',
    WATTING_APPROVAL: 'Aguardando aprovação',
    REJECTED: 'Recusado',
    TESTING: 'Em teste',
  },
};

export function catalogValueLabel(value: unknown, field?: string): string {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && !value.length)
  )
    return 'Não informado';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value))
    return value.map((item) => catalogValueLabel(item, field)).join('; ');
  if (typeof value === 'object')
    return (
      Object.entries(value)
        .map(
          ([key, item]) =>
            `${catalogFieldLabel(key)}: ${catalogValueLabel(item, key)}`,
        )
        .join('; ') || 'Não informado'
    );
  if (typeof value === 'number')
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 20 });
  if (field && catalogEnumLabels[field]?.[String(value)])
    return catalogEnumLabels[field][String(value)];
  if (
    field === 'expiredDate' &&
    /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(String(value))
  ) {
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
  return String(value);
}

export const catalogFieldLabels: Record<string, string> = {
  name: 'Nome',
  esocialCode: 'Código eSocial',
  method: 'Método',
  unit: 'Unidade de medida',
  type: 'Tipo',
  equipment: 'Equipamento',
  ca: 'CA',
  description: 'Descrição',
  medName: 'Medida de controle',
  medType: 'Tipo da medida',
  recName: 'Recomendação',
  recType: 'Tipo da recomendação',
  severity: 'Severidade',
  appendix: 'Anexo',
  grauInsalubridade: 'Grau de insalubridade',
  synonymous: 'Sinônimos',
  search: 'Termos de pesquisa',
  otherAppendix: 'Outras normas',
  risk: 'Risco à saúde',
  propagation: 'Meios de propagação',
  exame: 'Exame relacionado',
  symptoms: 'Sintomas e danos',
  affectedRegion: 'Regiões afetadas',
  absorptionRoutes: 'Vias de absorção',
  cas: 'Número CAS',
  breather: 'Proteção respiratória',
  nr15lt: 'Limite de tolerância NR-15',
  twa: 'ACGIH TWA',
  stel: 'ACGIH STEL',
  acgihCeiling: 'ACGIH teto',
  ipvs: 'NIOSH IDLH / IPVS',
  nioshRel: 'NIOSH REL',
  nioshStel: 'NIOSH STEL',
  nioshCeiling: 'NIOSH teto',
  oshaPel: 'OSHA PEL',
  oshaStel: 'OSHA STEL',
  oshaCeiling: 'OSHA teto',
  aihaWeel: 'AIHA WEEL',
  aihaWeelStel: 'AIHA WEEL STEL',
  aihaWeelCeiling: 'AIHA WEEL teto',
  pv: 'Pressão de vapor',
  pe: 'Ponto de ebulição',
  carnogenicityACGIH: 'Carcinogenicidade ACGIH',
  carnogenicityLinach: 'Carcinogenicidade LINACH',
  status: 'Situação',
  representAll: 'Aplicável a todos os riscos do tipo',
  isEmergency: 'Vinculado ao plano de emergência',
  json: 'Informações complementares',
  fraction: 'Fração',
  tlv: 'Limite de exposição',
  isAso: 'Incluído no ASO',
  isPCMSO: 'Incluído no PCMSO',
  isPGR: 'Incluído no PGR',
  isPPP: 'Incluído no PPP',
  coments: 'Observações',
  activities: 'Atividades',
  subActivity: 'Detalhe da atividade',
  rsdata: 'Referência de importação',
  isValid: 'Validade do certificado de aprovação',
  national: 'Fabricação nacional',
  expiredDate: 'Data de validade do CA',
  report: 'Laudo',
  restriction: 'Restrições',
  observation: 'Observações',
  rawSituation: 'Situação informada pelo órgão emissor',
  processNumber: 'Número do processo',
  manufacturerCnpj: 'CNPJ do fabricante',
  manufacturerName: 'Fabricante',
  brand: 'Marca',
  reference: 'Referência',
  color: 'Cor',
  laboratoryCnpj: 'CNPJ do laboratório',
  laboratoryName: 'Laboratório',
  reportNumber: 'Número do laudo',
  standard: 'Norma técnica',
  id: 'Identificação',
  riskId: 'Risco associado',
  companyId: 'Empresa',
  generateSourceId: 'Fonte geradora associada',
  system: 'Cadastro compartilhado do sistema',
  created_at: 'Data de cadastro',
  updated_at: 'Última atualização',
  deleted_at: 'Data de exclusão',
};

export function catalogFieldLabel(field: string): string {
  return catalogFieldLabels[field] || 'Informação do cadastro';
}
