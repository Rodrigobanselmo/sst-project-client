import {
  CHARACTERIZATION_AI_ASSIST_MOTOR_MIN_CHARS,
  splitMotorGuardrailIssues,
  validateCharacterizationAiAssistMotorContent,
} from './validate-characterization-ai-assist-motor-content.util';

describe('validateCharacterizationAiAssistMotorContent (client)', () => {
  it('blocks empty and short motors', () => {
    expect(
      splitMotorGuardrailIssues(
        validateCharacterizationAiAssistMotorContent(''),
      ).blocking.some((issue) => issue.code === 'EMPTY'),
    ).toBe(true);

    expect(
      splitMotorGuardrailIssues(
        validateCharacterizationAiAssistMotorContent('curto'),
      ).blocking.some((issue) => issue.code === 'TOO_SHORT'),
    ).toBe(true);
  });

  it('accepts a conceptually complete motor', () => {
    const content = `
Objetivo do Assistente IA da Caracterização SST.
O especialista de IA é complementar e não substitui o motor.
Não invente dados sem evidência.
Trate fontes do sistema, URLs do usuário e pesquisa web com cautela.
Fotografias são apoio visual e não comprovam permanência.
Registre incertezas, inconsistências e cautelas.
Estrutura: Descrição, Processos e atividades, Fotografias, Considerações.
Respeite o schema JSON de saída.
Toda saída exige validação pelo responsável técnico antes da aprovação.
${'x'.repeat(CHARACTERIZATION_AI_ASSIST_MOTOR_MIN_CHARS)}
`.trim();

    expect(validateCharacterizationAiAssistMotorContent(content)).toEqual([]);
  });
});
