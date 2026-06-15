import type {
  HoMethodAiReviewResult,
  HoMethodImportParseResult,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export type HoMethodAiReviewDiffStatus = 'new' | 'different' | 'same';

export type HoMethodAiReviewDiffRow = {
  key: string;
  label: string;
  section: 'method' | 'sampling' | 'preparation' | 'analytical' | 'observations' | 'agents';
  parserValue: string | null;
  aiValue: string | null;
  status: HoMethodAiReviewDiffStatus;
  confidence?: 'high' | 'medium' | 'low';
  sourceTrace?: string | null;
  selectedByDefault: boolean;
};

const normalize = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';

const compareValues = (
  parserValue?: string | null,
  aiValue?: string | null,
): HoMethodAiReviewDiffStatus => {
  const parser = normalize(parserValue);
  const ai = normalize(aiValue);

  if (!ai) return 'same';
  if (!parser) return 'new';
  return parser === ai ? 'same' : 'different';
};

const pushRow = (
  rows: HoMethodAiReviewDiffRow[],
  row: Omit<HoMethodAiReviewDiffRow, 'status' | 'selectedByDefault'> & {
    status?: HoMethodAiReviewDiffStatus;
    selectedByDefault?: boolean;
  },
) => {
  const status = row.status ?? compareValues(row.parserValue, row.aiValue);
  if (status === 'same' && row.section !== 'agents') return;

  rows.push({
    ...row,
    status,
    selectedByDefault: row.selectedByDefault ?? status !== 'same',
  });
};

export function buildHoMethodAiReviewDiffRows(params: {
  parserResult: HoMethodImportParseResult;
  aiResult: HoMethodAiReviewResult;
}): HoMethodAiReviewDiffRow[] {
  const { parserResult, aiResult } = params;
  const rows: HoMethodAiReviewDiffRow[] = [];
  const fields = parserResult.fields;

  const methodMappings: Array<{ key: string; label: string; parser: string | null; ai: string | null }> = [
    {
      key: 'method.institution',
      label: 'Instituição',
      parser: fields.institution.value,
      ai: aiResult.method?.institution ?? null,
    },
    {
      key: 'method.methodCode',
      label: 'Código do método',
      parser: fields.methodCode.value,
      ai: aiResult.method?.methodCode ?? null,
    },
    {
      key: 'method.displayName',
      label: 'Nome do método',
      parser: fields.displayName.value,
      ai: aiResult.method?.displayName ?? null,
    },
    {
      key: 'method.analyticalMethod',
      label: 'Método analítico',
      parser: fields.analyticalMethod.value,
      ai: aiResult.method?.analyticalMethod ?? null,
    },
    {
      key: 'method.evaluation',
      label: 'Avaliação',
      parser: fields.evaluation.value,
      ai: aiResult.method?.evaluation ?? null,
    },
  ];

  methodMappings.forEach((item) =>
    pushRow(rows, {
      key: item.key,
      label: item.label,
      section: 'method',
      parserValue: item.parser,
      aiValue: item.ai,
    }),
  );

  const samplingMappings = [
    ['sampling.sampler', 'Amostrador', fields.sampler.value, aiResult.sampling?.samplerPtBr || aiResult.sampling?.samplerOriginal],
    ['sampling.flowMin', 'Vazão mínima', fields.minimumFlowRate.value != null ? String(fields.minimumFlowRate.value) : null, aiResult.sampling?.flowMin],
    ['sampling.flowMax', 'Vazão máxima', fields.maximumFlowRate.value != null ? String(fields.maximumFlowRate.value) : null, aiResult.sampling?.flowMax],
    ['sampling.volumeMin', 'Volume mínimo', fields.minimumVolume.value != null ? String(fields.minimumVolume.value) : null, aiResult.sampling?.volumeMin],
    ['sampling.volumeMax', 'Volume máximo', fields.maximumVolume.value != null ? String(fields.maximumVolume.value) : null, aiResult.sampling?.volumeMax],
    ['sampling.shipment', 'Envio', fields.shipment.value, aiResult.sampling?.shipment],
  ] as const;

  samplingMappings.forEach(([key, label, parser, ai]) =>
    pushRow(rows, {
      key,
      label,
      section: 'sampling',
      parserValue: parser ?? null,
      aiValue: (ai as string | null | undefined) ?? null,
    }),
  );

  if (aiResult.sampling?.samplerSuggestedMatchName) {
    pushRow(rows, {
      key: 'sampling.samplerMatch',
      label: 'Match amostrador cadastrado',
      section: 'sampling',
      parserValue: fields.sampler.value,
      aiValue: aiResult.sampling.samplerSuggestedMatchName,
      status: 'new',
      selectedByDefault: false,
    });
  }

  const preparationMappings = [
    ['preparation.stabilityDays', 'Estabilidade (dias)', fields.stabilityDays.value != null ? String(fields.stabilityDays.value) : null, aiResult.preparation?.stabilityDays],
    ['preparation.stabilityText', 'Estabilidade (texto)', fields.stabilityText.value, aiResult.preparation?.stabilityText],
    ['preparation.storageTemperature', 'Temperatura', fields.storageTemperature.value != null ? String(fields.storageTemperature.value) : null, aiResult.preparation?.storageTemperature],
    ['preparation.extractionSolvent', 'Solvente', fields.extractionSolvent.value, aiResult.preparation?.extractionSolventPtBr || aiResult.preparation?.extractionSolventOriginal],
  ] as const;

  preparationMappings.forEach(([key, label, parser, ai]) =>
    pushRow(rows, {
      key,
      label,
      section: 'preparation',
      parserValue: parser ?? null,
      aiValue: (ai as string | null | undefined) ?? null,
    }),
  );

  if (aiResult.preparation?.extractionSolventSuggestedMatchName) {
    pushRow(rows, {
      key: 'preparation.solventMatch',
      label: 'Match solvente cadastrado',
      section: 'preparation',
      parserValue: fields.extractionSolvent.value,
      aiValue: aiResult.preparation.extractionSolventSuggestedMatchName,
      status: 'new',
      selectedByDefault: false,
    });
  }

  const parserAgentsSummary = parserResult.agents
    .map((agent) => `${agent.substanceName}${agent.cas ? ` (${agent.cas})` : ''}`)
    .join('; ');
  const aiAgentsSummary = aiResult.agents
    .map((agent) => `${agent.name}${agent.cas ? ` (${agent.cas})` : ''}`)
    .join('; ');

  pushRow(rows, {
    key: 'agents.list',
    label: 'Agentes identificados',
    section: 'agents',
    parserValue: parserAgentsSummary || null,
    aiValue: aiAgentsSummary || null,
    selectedByDefault:
      (aiResult.diagnostics.parserComparison?.aiAgentCount ?? aiResult.agents.length) >
      parserResult.agents.length,
  });

  return rows;
}

export function getHoMethodAiReviewWarnings(aiResult: HoMethodAiReviewResult) {
  return [
    ...(aiResult.diagnostics.warnings ?? []),
    ...(aiResult.diagnostics.parserComparison?.differences ?? []),
  ];
}
