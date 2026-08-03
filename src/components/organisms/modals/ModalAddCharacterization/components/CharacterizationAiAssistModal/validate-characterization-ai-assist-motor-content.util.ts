export type CharacterizationAiAssistMotorGuardrailIssue = {
  code: string;
  message: string;
};

const MIN_MOTOR_CHARS = 800;

type ConceptualCheck = {
  code: string;
  message: string;
  patterns: RegExp[];
};

const CONCEPTUAL_CHECKS: ConceptualCheck[] = [
  {
    code: 'OBJECTIVE',
    message: 'Objetivo do motor (assistência à caracterização / SST)',
    patterns: [/objetivo/i, /caracteriza/i, /assist/i],
  },
  {
    code: 'PRECEDENCE',
    message: 'Precedência entre motor e especialista (especialista complementar)',
    patterns: [/especialista/i, /complement/i, /n[aã]o substitu/i, /motor/i],
  },
  {
    code: 'NO_INVENTION',
    message: 'Proibição de inventar dados sem evidência',
    patterns: [/n[aã]o invent/i, /sem evid[eê]ncia/i, /n[aã]o fabric/i, /n[aã]o presum/i],
  },
  {
    code: 'SOURCES',
    message: 'Tratamento de fontes (sistema, usuário, URL, web)',
    patterns: [/fonte/i, /url/i, /web/i, /sistema/i],
  },
  {
    code: 'PHOTOS',
    message: 'Fotografias como apoio visual (não comprovação automática)',
    patterns: [/foto/i, /apoio visual/i, /evid[eê]ncia visual/i],
  },
  {
    code: 'UNCERTAINTY',
    message: 'Incertezas e inconsistências',
    patterns: [/incertez/i, /inconsist/i, /cautel/i],
  },
  {
    code: 'DOC_STRUCTURE',
    message:
      'Estrutura documental Descrição → Processos e atividades → Fotografias → Considerações',
    patterns: [/descri/i, /processo/i, /atividad/i, /considera/i],
  },
  {
    code: 'SCHEMA',
    message: 'Contrato de saída / schema JSON',
    patterns: [/schema/i, /json/i, /sa[ií]da/i, /formato/i],
  },
  {
    code: 'HUMAN_VALIDATION',
    message: 'Validação pelo responsável técnico',
    patterns: [/respons[aá]vel t[eé]cnico/i, /valida/i, /aprova/i, /humana/i],
  },
];

export function validateCharacterizationAiAssistMotorContent(
  content: string,
): CharacterizationAiAssistMotorGuardrailIssue[] {
  const trimmed = content?.trim() || '';
  const issues: CharacterizationAiAssistMotorGuardrailIssue[] = [];

  if (!trimmed) {
    issues.push({
      code: 'EMPTY',
      message: 'O motor não pode estar vazio.',
    });
    return issues;
  }

  if (trimmed.length < MIN_MOTOR_CHARS) {
    issues.push({
      code: 'TOO_SHORT',
      message: `O motor parece incompleto (mínimo sugerido: ${MIN_MOTOR_CHARS} caracteres; atual: ${trimmed.length}).`,
    });
  }

  for (const check of CONCEPTUAL_CHECKS) {
    const matched = check.patterns.some((pattern) => pattern.test(trimmed));
    if (!matched) {
      issues.push({
        code: check.code,
        message: `Conceito estrutural ausente ou pouco explícito: ${check.message}.`,
      });
    }
  }

  return issues;
}

export function splitMotorGuardrailIssues(
  issues: CharacterizationAiAssistMotorGuardrailIssue[],
) {
  const blocking = issues.filter(
    (issue) => issue.code === 'EMPTY' || issue.code === 'TOO_SHORT',
  );
  const warnings = issues.filter(
    (issue) => issue.code !== 'EMPTY' && issue.code !== 'TOO_SHORT',
  );
  return { blocking, warnings };
}

export const CHARACTERIZATION_AI_ASSIST_MOTOR_MIN_CHARS = MIN_MOTOR_CHARS;
