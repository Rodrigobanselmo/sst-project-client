import {
  applyExamRiskAiPromptDraft,
  hasAnyExamRiskAiPromptDraftFieldFilled,
  type ExamRiskAiPromptDraftCurrentState,
  type ExamRiskAiPromptDraftMergeMode,
} from './exam-risk-ai-prompt-draft-merge.util';
import { createDefaultExamRiskAiAssistantFormValues } from './exam-risk-ai-assistant.types';

describe('exam-risk-ai-prompt-draft-merge.util', () => {
  const draft = {
    riskId: 'risk-1',
    riskName: 'Escadas e rampas inadequadas',
    riskType: 'ACI' as const,
    modelName: 'Modelo ACI',
    modelDescription: 'Descrição sugerida',
    examSearch: 'avaliação clínica',
    examType: '',
    suggestedCandidateLimit: 12,
    instructions: 'Instruções sugeridas',
    positiveExamples: 'Avaliação Clínica Ocupacional',
    negativeExamples: 'Hemograma',
    cautions: 'Não substitui controle organizacional',
    sessionAdditionalInstruction: 'Revisar tecnicamente',
    warnings: [],
    meta: {
      generatedAt: '2026-07-07T00:00:00.000Z',
      model: 'gpt-4o-mini',
    },
  };

  it('detecta campos preenchidos', () => {
    expect(
      hasAnyExamRiskAiPromptDraftFieldFilled({
        presetName: '',
        presetDescription: '',
        formValues: createDefaultExamRiskAiAssistantFormValues(),
      }),
    ).toBe(false);

    expect(
      hasAnyExamRiskAiPromptDraftFieldFilled({
        presetName: '',
        presetDescription: '',
        formValues: {
          ...createDefaultExamRiskAiAssistantFormValues(),
          instructions: 'já preenchido',
        },
      }),
    ).toBe(true);
  });

  it('empty-only preserva campos preenchidos', () => {
    const current: ExamRiskAiPromptDraftCurrentState = {
      presetName: '',
      presetDescription: 'Descrição atual',
      formValues: {
        ...createDefaultExamRiskAiAssistantFormValues(),
        instructions: 'Instrução atual',
      },
    };

    const merged = applyExamRiskAiPromptDraft(current, draft, 'empty-only');

    expect(merged.presetName).toBe('Modelo ACI');
    expect(merged.presetDescription).toBe('Descrição atual');
    expect(merged.formValues.instructions).toBe('Instrução atual');
    expect(merged.formValues.examSearch).toBe('avaliação clínica');
  });

  it('replace-all substitui todos os campos mapeados', () => {
    const current: ExamRiskAiPromptDraftCurrentState = {
      presetName: 'Antigo',
      presetDescription: 'Descrição atual',
      formValues: {
        ...createDefaultExamRiskAiAssistantFormValues(),
        instructions: 'Instrução atual',
      },
    };

    const merged = applyExamRiskAiPromptDraft(
      current,
      draft,
      'replace-all' as ExamRiskAiPromptDraftMergeMode,
    );

    expect(merged.presetName).toBe('Modelo ACI');
    expect(merged.presetDescription).toBe('Descrição sugerida');
    expect(merged.formValues.instructions).toBe('Instruções sugeridas');
    expect(merged.formValues.limit).toBe(12);
  });
});
