import {
  buildCharacterizationAiAssistArchitecturePreview,
  resolveSpecialistPromptCopyPayload,
} from './build-characterization-ai-assist-architecture-preview.util';
import { buildCharacterizationAiSpecialistPromptAppendix } from './build-characterization-ai-specialist-prompt-appendix.util';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

const fullSpecialistInput = {
  id: 'planlink-1',
  name: 'Planlink — Consultoria offshore',
  version: 2,
  objective: 'Objetivo técnico com\nquebra de linha e acentos: ação.',
  category: 'Offshore e Marítimo',
  instructions: 'Regras gerais & cautelas <especiais>.',
  fieldInstructions: {
    description: 'Orientação Descrição',
    workActivities: 'Orientação Processos',
    photos: 'Orientação Fotografias',
    considerations: 'Orientação Considerações',
  },
};

describe('buildCharacterizationAiSpecialistPromptAppendix', () => {
  it('concatenates fields in the official appendix order', () => {
    const appendix =
      buildCharacterizationAiSpecialistPromptAppendix(fullSpecialistInput);

    const markers = [
      '=== ESPECIALISTA DE IA DA CARACTERIZAÇÃO (COMPLEMENTAR AO MOTOR) ===',
      'Especialista: Planlink — Consultoria offshore',
      'Versão: 2',
      'Categoria: Offshore e Marítimo',
      'Objetivo técnico:',
      'Orientações por bloco do documento SimpleSST:',
      '- Descrição:',
      '- Processos e atividades:',
      '- Orientações para interpretação das fotografias',
      '- Considerações:',
      'Regras gerais e cautelas do especialista:',
    ];

    let lastIndex = -1;
    for (const marker of markers) {
      const index = appendix.indexOf(marker);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }

    expect(appendix).toContain('quebra de linha e acentos: ação.');
    expect(appendix).toContain('Regras gerais & cautelas <especiais>.');
  });

  it('omits empty optional blocks without orphan titles', () => {
    const appendix = buildCharacterizationAiSpecialistPromptAppendix({
      id: 'minimal',
      name: 'Mínimo',
      version: 1,
      objective: null,
      category: null,
      instructions: 'Somente regras.',
      fieldInstructions: {
        description: '',
        workActivities: '  ',
        photos: '',
        considerations: '',
      },
    });

    expect(appendix).toContain('Especialista: Mínimo');
    expect(appendix).toContain('Regras gerais e cautelas do especialista:');
    expect(appendix).not.toContain('Categoria:');
    expect(appendix).not.toContain('Objetivo técnico:');
    expect(appendix).not.toContain('Orientações por bloco do documento SimpleSST:');
    expect(appendix).not.toContain('- Descrição:');
    expect(appendix).not.toContain('- Processos e atividades:');
  });

  it('preserves line breaks inside objective and instructions', () => {
    const appendix = buildCharacterizationAiSpecialistPromptAppendix({
      id: 'breaks',
      name: 'Com quebras',
      version: 1,
      objective: 'Linha 1\nLinha 2',
      category: null,
      instructions: 'A\nB\nC',
      fieldInstructions: null,
    });

    expect(appendix).toContain('Objetivo técnico:\nLinha 1\nLinha 2');
    expect(appendix).toContain(
      'Regras gerais e cautelas do especialista:\nA\nB\nC',
    );
  });
});

describe('buildCharacterizationAiAssistArchitecturePreview specialist layer', () => {
  it('uses the same appendix text in isolation and in the effective prompt', () => {
    const specialistDto = {
      id: fullSpecialistInput.id,
      companyId: 'c1',
      name: fullSpecialistInput.name,
      objective: fullSpecialistInput.objective,
      description: 'Resumo administrativo (não vai no appendix)',
      usageGuidance: 'Quando utilizar (não vai no appendix)',
      instructions: fullSpecialistInput.instructions,
      fieldInstructions: fullSpecialistInput.fieldInstructions,
      recommendedCharacterizationTypes: [CharacterizationTypeEnum.WORKSTATION],
      category: fullSpecialistInput.category,
      internalNotes: null,
      isCompanyDefault: false,
      isActive: true,
      version: fullSpecialistInput.version,
      origin: {
        sourceKind: 'MANUAL' as const,
        sourceProfileId: null,
        sourceCompanyId: null,
        copiedAt: null,
      },
      createdBy: null,
      updatedBy: null,
      createdAt: '',
      updatedAt: '',
    };

    const expectedAppendix =
      buildCharacterizationAiSpecialistPromptAppendix(fullSpecialistInput);

    const preview = buildCharacterizationAiAssistArchitecturePreview({
      motorPrompt: 'MOTOR_BASE',
      specialist: specialistDto,
      questionnaire: {
        characterizationScope: 'THIRD_PARTY',
        companyRole: 'SERVICE_CONSULTING',
        characterizationTarget: 'WORKSTATION',
        outputIntent: 'GENERATE_FINAL',
        useAttachedPhotos: false,
      },
      userObservations: '',
      userProvidedSources: '',
      enableWebSearch: false,
      temporaryDocumentSource: null,
      characterization: {
        name: 'Posto',
        type: 'WORKSTATION',
        paragraphs: [],
        activities: [],
        considerations: [],
        photos: [],
      },
      labels: {
        scope: {
          OWN_ESTABLISHMENT: 'Próprio',
          THIRD_PARTY: 'Terceiro',
          EXTERNAL_ITINERANT: 'Externa',
          SPECIFIC_EQUIPMENT: 'Equipamento',
        },
        companyRole: {
          DIRECT_OPERATOR: 'Opera',
          SERVICE_CONSULTING: 'Consultoria',
          MAINTENANCE: 'Manutenção',
          ADMINISTRATIVE: 'Admin',
        },
        target: {
          FULL_ESTABLISHMENT: 'Estabelecimento',
          SECTOR: 'Setor',
          WORKSTATION: 'Posto',
          ACTIVITY: 'Atividade',
          VESSEL_PLATFORM_EQUIPMENT: 'Embarcação',
          WORK_FRONT: 'Frente',
        },
        outputIntent: {
          GENERATE_FINAL: 'Gerar final',
          REVIEW_EXISTING: 'Revisar',
          CRITICAL_ONLY: 'Crítica',
        },
      },
    });

    expect(preview.specialistAppendix).toBe(expectedAppendix);
    expect(preview.effectivePromptPreview).toContain(expectedAppendix);
    expect(preview.specialistAppendix).not.toContain(
      'Resumo administrativo (não vai no appendix)',
    );
    expect(preview.specialistAppendix).not.toContain(
      'Quando utilizar (não vai no appendix)',
    );
  });
});

/**
 * Pure helper exercised by the architecture UI "Copiar" action.
 * Kept here so the copy payload stays identical to the consolidated view.
 */
export function resolveSpecialistPromptCopyPayload(
  specialistAppendix: string | null | undefined,
): string {
  return specialistAppendix?.trim() ? specialistAppendix : '';
}

describe('resolveSpecialistPromptCopyPayload', () => {
  it('returns the full consolidated appendix for clipboard', () => {
    const appendix =
      buildCharacterizationAiSpecialistPromptAppendix(fullSpecialistInput);
    expect(resolveSpecialistPromptCopyPayload(appendix)).toBe(appendix);
    expect(resolveSpecialistPromptCopyPayload(null)).toBe('');
  });
});
