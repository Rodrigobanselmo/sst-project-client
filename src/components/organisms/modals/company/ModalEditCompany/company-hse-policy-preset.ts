/**
 * Preset/sugestão client-side da Política de Saúde, Segurança e Meio Ambiente.
 * Não é default de banco: só preenche o formulário quando o usuário aciona a ação.
 */

import { resolveSingleFieldPresetApplication } from './company-text-preset';

export const SIMPLESST_HSE_POLICY_PRESET =
  'Promover ambientes de trabalho seguros e saudáveis, prevenir acidentes, doenças ocupacionais e impactos ambientais, atender aos requisitos legais e demais compromissos aplicáveis, incentivar a participação e a conscientização das pessoas e buscar continuamente a melhoria do desempenho em saúde, segurança e meio ambiente.';

export const HSE_POLICY_PRESET_OVERWRITE_MESSAGE =
  'Já existe texto em Política de Saúde, Segurança e Meio Ambiente. Deseja substituí-lo pela sugestão do SimpleSST? O campo continuará editável e nada será salvo até você clicar em Salvar.';

export function resolveHsePolicyPresetApplication(params: {
  current?: string | null;
  confirmedOverwrite: boolean;
}): string | 'needs-confirmation' {
  return resolveSingleFieldPresetApplication({
    current: params.current,
    preset: SIMPLESST_HSE_POLICY_PRESET,
    confirmedOverwrite: params.confirmedOverwrite,
  });
}
