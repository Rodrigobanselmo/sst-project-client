import type { CharacterizationAiProfileFieldInstructions } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';

export type CharacterizationAiSpecialistPromptInput = {
  id: string;
  name: string;
  version: number;
  objective: string | null;
  instructions: string;
  fieldInstructions: CharacterizationAiProfileFieldInstructions | null;
  category: string | null;
};

/**
 * Client mirror of the API appendix builder.
 * Used only for MASTER transparency / effective-prompt preview.
 * Does not replace CHARACTERIZATION_AI_ASSIST (motor).
 */
export function buildCharacterizationAiSpecialistPromptAppendix(
  specialist: CharacterizationAiSpecialistPromptInput,
): string {
  const lines: string[] = [
    '=== ESPECIALISTA DE IA DA CARACTERIZAÇÃO (COMPLEMENTAR AO MOTOR) ===',
    'As instruções abaixo ESPECIALIZAM o comportamento da IA para este contexto.',
    'Elas NÃO substituem o motor estrutural do Assistente (schema, fontes, guardrails, contrato de saída).',
    `Especialista: ${specialist.name}`,
    `Versão: ${specialist.version}`,
  ];

  if (specialist.category?.trim()) {
    lines.push(`Categoria: ${specialist.category.trim()}`);
  }

  if (specialist.objective?.trim()) {
    lines.push(`Objetivo técnico:\n${specialist.objective.trim()}`);
  }

  const fields = specialist.fieldInstructions;
  if (fields) {
    lines.push('Orientações por bloco do documento SimpleSST:');
    if (fields.description?.trim()) {
      lines.push(`- Descrição:\n${fields.description.trim()}`);
    }
    if (fields.workActivities?.trim()) {
      lines.push(`- Processos e atividades:\n${fields.workActivities.trim()}`);
    }
    if (fields.photos?.trim()) {
      lines.push(
        `- Orientações para interpretação das fotografias (não geram texto próprio no DOCX; as fotos ficam entre Processos e Considerações):\n${fields.photos.trim()}`,
      );
    }
    if (fields.considerations?.trim()) {
      lines.push(`- Considerações:\n${fields.considerations.trim()}`);
    }
  }

  if (specialist.instructions?.trim()) {
    lines.push(
      `Regras gerais e cautelas do especialista:\n${specialist.instructions.trim()}`,
    );
  }

  return lines.join('\n\n');
}
