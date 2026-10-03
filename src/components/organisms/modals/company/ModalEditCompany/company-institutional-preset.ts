/**
 * Preset/sugestão client-side de textos institucionais (Missão / Visão / Valores).
 * Não é default de banco: só preenche o formulário quando o usuário aciona a ação.
 */

import { isTextPresetFieldEmpty } from './company-text-preset';

export const SIMPLESST_INSTITUTIONAL_PRESET = {
  mission:
    'Desenvolver nossas atividades com qualidade, segurança e responsabilidade, buscando atender às necessidades de clientes e demais partes interessadas, promovendo a melhoria contínua dos processos, a valorização das pessoas e o respeito ao meio ambiente.',
  vision:
    'Ser reconhecida pela excelência na realização de suas atividades, pela confiabilidade de seus processos e pelo compromisso com a qualidade, a saúde e segurança das pessoas, a sustentabilidade e a melhoria contínua.',
  values:
    'Ética e integridade; respeito às pessoas; compromisso com a saúde e a segurança; responsabilidade socioambiental; qualidade e excelência; cumprimento dos requisitos aplicáveis; prevenção de riscos; melhoria contínua; transparência nas relações; e valorização do trabalho em equipe.',
} as const;

export type InstitutionalFields = {
  mission?: string | null;
  vision?: string | null;
  values?: string | null;
};

export function isInstitutionalFieldEmpty(value?: string | null): boolean {
  return isTextPresetFieldEmpty(value);
}

export function hasAnyInstitutionalContent(
  fields: InstitutionalFields,
): boolean {
  return (
    !isInstitutionalFieldEmpty(fields.mission) ||
    !isInstitutionalFieldEmpty(fields.vision) ||
    !isInstitutionalFieldEmpty(fields.values)
  );
}

/**
 * Decide se o preset pode ser aplicado de imediato ou exige confirmação.
 * Não persiste nada — apenas devolve os textos a colocar no formulário.
 */
export function resolveInstitutionalPresetApplication(params: {
  current: InstitutionalFields;
  confirmedOverwrite: boolean;
}): typeof SIMPLESST_INSTITUTIONAL_PRESET | 'needs-confirmation' {
  if (!hasAnyInstitutionalContent(params.current)) {
    return { ...SIMPLESST_INSTITUTIONAL_PRESET };
  }

  if (!params.confirmedOverwrite) {
    return 'needs-confirmation';
  }

  return { ...SIMPLESST_INSTITUTIONAL_PRESET };
}

export const INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE =
  'Já existem textos em Missão, Visão ou Valores. Deseja substituí-los pela sugestão do SimpleSST? Os campos continuarão editáveis e nada será salvo até você clicar em Salvar.';
