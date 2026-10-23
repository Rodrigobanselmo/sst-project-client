import { EXAM_RISK_AI_DEFAULT_MODEL, EXAM_RISK_AI_MODEL_OPTIONS } from './exam-risk-ai-model-options';
import { mapExamRiskAiPresetToState } from './exam-risk-ai-assistant-preset.util';
import { buildExamRiskAiAssistantPayload, createDefaultExamRiskAiAssistantFormValues } from './exam-risk-ai-assistant.types';
import { readFileSync } from 'fs';
import { join } from 'path';

it('reutiliza Sol e mantém modelos legados selecionáveis', () => {
  expect(EXAM_RISK_AI_DEFAULT_MODEL).toBe('gpt-6.1-sol');
  expect(EXAM_RISK_AI_MODEL_OPTIONS).toContainEqual({ label: 'GPT-6.1 Sol', value: 'gpt-6.1-sol' });
  expect(EXAM_RISK_AI_MODEL_OPTIONS.some(option => option.value === 'gpt-4o-mini')).toBe(true);
});
it('mantém modelo explicitamente salvo ao carregar e enviar o formulário', () => {
  const mapped = mapExamRiskAiPresetToState({ config: { aiConfig: { model: 'gpt-4o' } } } as never);
  expect(buildExamRiskAiAssistantPayload(mapped.formValues).aiConfig.model).toBe('gpt-4o');
  expect(buildExamRiskAiAssistantPayload(createDefaultExamRiskAiAssistantFormValues()).aiConfig.model).toBeUndefined();
});
it.each(['ExamRiskAiPromptDraftMasterConfigDialog.tsx', 'ExamRiskAiPromptGuidanceMasterConfigDialog.tsx'])('configura o seletor local com Sol sem mudar outros consumidores (%s)', file => {
 const source = readFileSync(join(__dirname, file), 'utf8');
 expect(source).toContain('defaultModelValue={EXAM_RISK_AI_DEFAULT_MODEL}');
 expect(source).toContain('modelOptions={EXAM_RISK_AI_MODEL_OPTIONS}');
});

it('usa seletor empresarial sem alterar o campo legado dos outros assistentes', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { ExamRiskAiAssistantConfigForm } = require('./ExamRiskAiAssistantConfigForm');
  const props = { values: createDefaultExamRiskAiAssistantFormValues(), onFieldChange: jest.fn() };
  const company = renderToStaticMarkup(React.createElement(ExamRiskAiAssistantConfigForm, { ...props, companyModels: true }));
  const legacy = renderToStaticMarkup(React.createElement(ExamRiskAiAssistantConfigForm, props));
  expect(company).toContain('Padrão do sistema (GPT-6.1 Sol)');
  expect(legacy).toContain('Modelo IA opcional');
  expect(legacy).not.toContain('Padrão do sistema (GPT-6.1 Sol)');
});

it.each([false, true])('aplica permissão ao modelo salvo sem modificar outros campos (MASTER=%s)', (isMaster) => {
  const { buildCompanyExamRiskAiAssistantPayload } = require('./exam-risk-ai-assistant.types');
  const saved = mapExamRiskAiPresetToState({ config: { aiConfig: { model: 'gpt-4o', instructions: 'Instruções salvas' } } } as never);
  const payload = buildCompanyExamRiskAiAssistantPayload(saved.formValues, isMaster);
  expect(payload.aiConfig.model).toBe(isMaster ? 'gpt-4o' : undefined);
  expect(payload.aiConfig.instructions).toBe('Instruções salvas');
  expect(saved.formValues.model).toBe('gpt-4o');
});
it('exibe informação somente leitura para não MASTER mesmo com modelo salvo diferente', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { ExamRiskAiAssistantConfigForm } = require('./ExamRiskAiAssistantConfigForm');
  const html = renderToStaticMarkup(React.createElement(ExamRiskAiAssistantConfigForm, {
    values: { ...createDefaultExamRiskAiAssistantFormValues(), model: 'gpt-4o' },
    onFieldChange: jest.fn(), companyModels: true, canChooseModel: false,
  }));
  expect(html).toContain('Padrão do sistema (GPT-6.1 Sol)');
  expect(html).toMatch(/readonly/i);
  // The exam-type filter remains a combobox; the model is now a read-only input.
  expect(html.match(/role="combobox"/g)).toHaveLength(1);
  expect(html).not.toContain('value="gpt-4o"');
});
