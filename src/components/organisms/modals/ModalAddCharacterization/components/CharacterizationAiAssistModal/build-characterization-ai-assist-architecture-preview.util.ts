import type { CharacterizationAiProfileDto } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import type {
  AiCharacterizationAssistCompanyRole,
  AiCharacterizationAssistOutputIntent,
  AiCharacterizationAssistQuestionnaire,
  AiCharacterizationAssistScope,
  AiCharacterizationAssistTarget,
  AiTemporaryDocumentSource,
} from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';

import { buildCharacterizationAiSpecialistPromptAppendix } from './build-characterization-ai-specialist-prompt-appendix.util';

export type CharacterizationAiAssistArchitectureSourceStatus = {
  key: string;
  label: string;
  used: boolean;
  detail: string;
};

export type CharacterizationAiAssistArchitectureQuestionnaireRow = {
  key: string;
  label: string;
  value: string;
};

export type CharacterizationAiAssistArchitecturePreviewInput = {
  motorPrompt: string;
  specialist: CharacterizationAiProfileDto | null;
  questionnaire: AiCharacterizationAssistQuestionnaire;
  userObservations: string;
  userProvidedSources: string;
  enableWebSearch: boolean;
  temporaryDocumentSource: AiTemporaryDocumentSource | null;
  characterization: {
    name?: string | null;
    type?: string | null;
    paragraphs?: string[] | null;
    activities?: string[] | null;
    considerations?: string[] | null;
    photos?: unknown[] | null;
    temperature?: string | null;
    noiseValue?: string | null;
    luminosity?: string | null;
    moisturePercentage?: string | null;
  };
  labels: {
    scope: Record<AiCharacterizationAssistScope, string>;
    companyRole: Record<AiCharacterizationAssistCompanyRole, string>;
    target: Record<AiCharacterizationAssistTarget, string>;
    outputIntent: Record<AiCharacterizationAssistOutputIntent, string>;
  };
};

export type CharacterizationAiAssistArchitecturePreview = {
  questionnaireRows: CharacterizationAiAssistArchitectureQuestionnaireRow[];
  sourceStatuses: CharacterizationAiAssistArchitectureSourceStatus[];
  specialistAppendix: string | null;
  effectivePromptPreview: string;
};

function countItems(items?: string[] | null): number {
  return (items || []).filter((item) => String(item || '').trim()).length;
}

function countUrls(text: string): number {
  const matches = text.match(/https?:\/\/[^\s]+/gi);
  return matches?.length ?? 0;
}

function formatEnvironmental(params: {
  temperature?: string | null;
  noiseValue?: string | null;
  luminosity?: string | null;
  moisturePercentage?: string | null;
}): { used: boolean; detail: string; lines: string[] } {
  const lines: string[] = [];
  if (params.temperature?.trim()) {
    lines.push(`Temperatura: ${params.temperature.trim()}`);
  }
  if (params.noiseValue?.trim()) {
    lines.push(`Ruído: ${params.noiseValue.trim()}`);
  }
  if (params.luminosity?.trim()) {
    lines.push(`Luminosidade: ${params.luminosity.trim()}`);
  }
  if (params.moisturePercentage?.trim()) {
    lines.push(`Umidade: ${params.moisturePercentage.trim()}`);
  }
  return {
    used: lines.length > 0,
    detail: lines.length ? `${lines.length} parâmetro(s)` : 'Não utilizado',
    lines,
  };
}

export function buildCharacterizationAiAssistArchitecturePreview(
  input: CharacterizationAiAssistArchitecturePreviewInput,
): CharacterizationAiAssistArchitecturePreview {
  const q = input.questionnaire;
  const photosCount = input.characterization.photos?.length ?? 0;
  const photosUsed = Boolean(q.useAttachedPhotos && photosCount > 0);
  const urlCount = countUrls(input.userProvidedSources);
  const observationsUsed = Boolean(input.userObservations.trim());
  const pdfUsed = Boolean(input.temporaryDocumentSource?.extractedText?.trim());
  const environmental = formatEnvironmental(input.characterization);

  const questionnaireRows: CharacterizationAiAssistArchitectureQuestionnaireRow[] =
    [
      {
        key: 'scope',
        label: 'Caracterização',
        value: input.labels.scope[q.characterizationScope],
      },
      {
        key: 'companyRole',
        label: 'Empresa',
        value: input.labels.companyRole[q.companyRole],
      },
      {
        key: 'target',
        label: 'Objeto',
        value: input.labels.target[q.characterizationTarget],
      },
      {
        key: 'outputIntent',
        label: 'Modo',
        value: input.labels.outputIntent[q.outputIntent],
      },
    ];

  const sourceStatuses: CharacterizationAiAssistArchitectureSourceStatus[] = [
    {
      key: 'photos',
      label: 'Fotos',
      used: photosUsed,
      detail: q.useAttachedPhotos
        ? photosCount
          ? `${photosCount} foto(s) anexada(s)`
          : 'Marcado, mas sem fotos anexadas'
        : 'Não utilizado',
    },
    {
      key: 'audio',
      label: 'Áudios',
      used: false,
      detail: 'Não utilizado nesta execução',
    },
    {
      key: 'pdf',
      label: 'PDF',
      used: pdfUsed,
      detail: pdfUsed
        ? input.temporaryDocumentSource?.fileName || 'PDF temporário anexado'
        : 'Não utilizado',
    },
    {
      key: 'links',
      label: 'Links',
      used: urlCount > 0,
      detail: urlCount > 0 ? `${urlCount} URL(s) informada(s)` : 'Não utilizado',
    },
    {
      key: 'observations',
      label: 'Observações livres',
      used: observationsUsed,
      detail: observationsUsed
        ? `${input.userObservations.trim().length} caracteres`
        : 'Não utilizado',
    },
    {
      key: 'web',
      label: 'Pesquisa web',
      used: input.enableWebSearch,
      detail: input.enableWebSearch
        ? 'Solicitada (resolvida no servidor na geração)'
        : 'Não utilizado',
    },
    {
      key: 'environmental',
      label: 'Parâmetros ambientais',
      used: environmental.used,
      detail: environmental.detail,
    },
  ];

  const specialistAppendix = input.specialist
    ? buildCharacterizationAiSpecialistPromptAppendix({
        id: input.specialist.id,
        name: input.specialist.name,
        version: input.specialist.version,
        objective: input.specialist.objective,
        instructions: input.specialist.instructions,
        fieldInstructions: input.specialist.fieldInstructions,
        category: input.specialist.category,
      })
    : null;

  const paragraphsCount = countItems(input.characterization.paragraphs);
  const activitiesCount = countItems(input.characterization.activities);
  const considerationsCount = countItems(input.characterization.considerations);

  const effectivePromptPreview = [
    '########## CAMADA 1 — MOTOR BASE DO SISTEMA ##########',
    input.motorPrompt.trim() || '(motor vazio)',
    '',
    '########## CAMADA 2 — ESPECIALISTA DE IA ##########',
    specialistAppendix ||
      '(nenhum especialista selecionado — somente motor)',
    '',
    '########## CAMADA 3 — QUESTIONÁRIO RESPONDIDO ##########',
    ...questionnaireRows.map((row) => `${row.label}: ${row.value}`),
    `Usar fotos anexadas: ${q.useAttachedPhotos ? 'sim' : 'não'}`,
    `Pesquisa web independente: ${input.enableWebSearch ? 'sim' : 'não'}`,
    '',
    '########## CAMADA 4 — CONTEXTO DA CARACTERIZAÇÃO ##########',
    `Nome: ${input.characterization.name || '(sem nome)'}`,
    `Tipo: ${input.characterization.type || '(sem tipo)'}`,
    `Parágrafos de descrição: ${paragraphsCount}`,
    `Atividades/processos: ${activitiesCount}`,
    `Considerações: ${considerationsCount}`,
    '',
    '########## CAMADA 5 — FOTOS ##########',
    photosUsed
      ? `${photosCount} foto(s) serão enviadas como apoio visual na geração.`
      : 'Fotos não serão enviadas nesta execução.',
    '',
    '########## CAMADA 6 — PARÂMETROS AMBIENTAIS ##########',
    environmental.used
      ? environmental.lines.join('\n')
      : 'Nenhum parâmetro ambiental preenchido.',
    '',
    '########## CAMADA 7 — FONTES EXTERNAS / CONTEXTO DE EXECUÇÃO ##########',
    observationsUsed
      ? `Observações livres:\n${input.userObservations.trim()}`
      : 'Observações livres: (não utilizadas)',
    '',
    input.userProvidedSources.trim()
      ? `Fontes/links informados:\n${input.userProvidedSources.trim()}`
      : 'Fontes/links informados: (não utilizados)',
    '',
    pdfUsed
      ? `PDF temporário: ${input.temporaryDocumentSource?.fileName || 'anexado'} (texto extraído será incluído no servidor).`
      : 'PDF temporário: (não utilizado)',
    '',
    input.enableWebSearch
      ? 'Pesquisa web: solicitada (resultados resolvidos no servidor no momento da geração).'
      : 'Pesquisa web: não solicitada',
    '',
    '########## REGRAS AUTOMÁTICAS DO SISTEMA ##########',
    '- Schema JSON de saída e guardrails estruturais permanecem no motor.',
    '- Fontes externas (PDF/URL/web) são resolvidas e sanitizadas no servidor.',
    '- O especialista complementa o motor; não o substitui.',
    '',
    '########## NOTA DE TRANSPARÊNCIA ##########',
    'Prévia montada no cliente para auditoria da arquitetura desta execução.',
    'Conteúdo exato de PDFs/URLs/pesquisa web é materializado no servidor na geração.',
  ].join('\n');

  return {
    questionnaireRows,
    sourceStatuses,
    specialistAppendix,
    effectivePromptPreview,
  };
}

/**
 * Clipboard payload for "Copiar" must be identical to the consolidated specialist view.
 */
export function resolveSpecialistPromptCopyPayload(
  specialistAppendix: string | null | undefined,
): string {
  return specialistAppendix?.trim() ? specialistAppendix : '';
}
