import { SeverityEnum } from 'project/enum/severity.enums';

const CHEMICAL_PHYSICAL_SEVERITY_TOOLTIPS: Record<SeverityEnum, string> = {
  [SeverityEnum.LOW]:
    '1 — DESPREZÍVEL\nEfeitos reversíveis de pouca importância ou nenhum agravamento à saúde conhecido.',
  [SeverityEnum.MEDIUM_LOW]:
    '2 — PEQUENO\nEfeitos nocivos ou adversos subclínicos, leves e reversíveis.\nIrritantes de pele e mucosas.\nSem evidência de carcinogenicidade, teratogenicidade ou mutagenicidade.',
  [SeverityEnum.MEDIUM]:
    '3 — MODERADO\nEfeitos adversos reversíveis moderados que não deixam sequelas.\nLevemente irritante de pele e mucosas.\nEfeito de carcinogenicidade, teratogenicidade ou mutagenicidade confirmado somente para animais.',
  [SeverityEnum.MEDIUM_HIGH]:
    '4 — SIGNIFICANTE\nEfeitos adversos reversíveis severos.\nEfeitos irreversíveis que não conduzem à incapacidade de exercer as atividades pertinentes à função, embora possa ocorrer diminuição da qualidade de vida.\nIrritante de pele e mucosas em grau relevante.\nSuspeito de ser carcinogênico, teratogênico ou mutagênico para seres humanos.',
  [SeverityEnum.HIGH]:
    '5 — EXCESSIVA\nEfeitos adversos irreversíveis que conduzem à incapacidade de exercer atividades na função.\nEfeitos adversos irreversíveis que afetem a expectativa de vida.\nIrritante severo de pele e mucosas, corrosivos.\nEfeito carcinogênico, teratogênico ou mutagênico confirmado para seres humanos.\nPotencial de morte, asfixia química, toxicidade sistêmica aguda grave, IDLH/IPVS crítico ou dano irreversível grave.',
};

const BIOLOGICAL_SEVERITY_TOOLTIPS: Record<SeverityEnum, string> = {
  [SeverityEnum.LOW]:
    '1 — DESPREZÍVEL\nFonte verificada como ausente de agentes biológicos patógenos, durante o manuseio de matéria viva ou originária de seres vivos, ou no tratamento de patologia humana ou animal não associada a bactérias, vírus e outros agentes patógenos.',
  [SeverityEnum.MEDIUM_LOW]:
    '2 — PEQUENO\nAgente classe 2 com precaução de contato básica, sem risco por gotículas ou aerossol.',
  [SeverityEnum.MEDIUM]:
    '3 — MODERADO\nAgente classe 2 — NR32 com risco por aerossol ou gotículas, ou classe 3 — NR32 com risco de contágio por acidente com perfurocortantes.',
  [SeverityEnum.MEDIUM_HIGH]:
    '4 — SIGNIFICANTE\nAgente classe 3 — NR32, capaz de oferecer risco por aerossol ou gotículas.',
  [SeverityEnum.HIGH]:
    '5 — EXCESSIVA\nAgente exótico ou desconhecido ou classe 4 — NR32, onde não se conhece profilaxia para cura.',
};

const ERGONOMIC_SEVERITY_TOOLTIPS: Record<SeverityEnum, string> = {
  [SeverityEnum.LOW]:
    '1 — DESPREZÍVEL\nNenhuma lesão, efeito à saúde, sobrecargas humanas, perdas no processo e/ou meio ambiente, conforme abordagem da AET.\nRisco muito leve ou insignificante conforme as ferramentas ergonômicas utilizadas.',
  [SeverityEnum.MEDIUM_LOW]:
    '2 — PEQUENO\nPode prejudicar a integridade física e/ou a saúde, provocando lesão que implique incapacidade temporária por prazo igual ou inferior a 15 dias.\nPode causar danos leves aos equipamentos, processo, meio ambiente ou ligeira insatisfação no trabalhador e baixa sobrecarga física ou cognitiva.\nRisco aceitável conforme as ferramentas ergonômicas.',
  [SeverityEnum.MEDIUM]:
    '3 — MODERADO\nPode prejudicar a integridade física e/ou a saúde, provocando lesões ou doenças do trabalho que impliquem incapacidade temporária por prazo superior a 15 dias.\nPode causar danos moderados aos equipamentos, processo, meio ambiente ou insatisfação no trabalhador e moderada sobrecarga física ou cognitiva.\nRisco médio ou moderado conforme as ferramentas ergonômicas.',
  [SeverityEnum.MEDIUM_HIGH]:
    '4 — SIGNIFICANTE\nPode prejudicar a integridade física e/ou a saúde, provocando lesão ou sequelas permanentes com encaminhamento à reabilitação profissional do INSS.\nAltos danos aos equipamentos, processo, meio ambiente ou insatisfação no trabalhador e sobrecarga física ou cognitiva.\nRisco alto conforme as ferramentas ergonômicas.',
  [SeverityEnum.HIGH]:
    '5 — EXCESSIVA\nPode levar a óbito ou prejudicar a integridade física e/ou a saúde, provocando lesão ou sequelas permanentes com incapacidade permanente total.\nElevados danos aos equipamentos, processo, meio ambiente ou insatisfação no trabalhador e sobrecarga física ou cognitiva.\nRisco muito alto ou elevado conforme as ferramentas ergonômicas.',
};

const ACCIDENT_SEVERITY_TOOLTIPS: Record<SeverityEnum, string> = {
  [SeverityEnum.LOW]: '1 — DESPREZÍVEL\nNenhuma lesão ou efeito à saúde.',
  [SeverityEnum.MEDIUM_LOW]:
    '2 — PEQUENO\nPode prejudicar a integridade física e/ou a saúde, provocando lesão que implique incapacidade temporária por prazo igual ou inferior a 15 dias.',
  [SeverityEnum.MEDIUM]:
    '3 — MODERADO\nPode prejudicar a integridade física e/ou provocar agravos à saúde que não se enquadrem nas classificações anteriores e que façam a pessoa afetada ficar incapaz de executar seu trabalho normal durante alguns dias.',
  [SeverityEnum.MEDIUM_HIGH]:
    '4 — SIGNIFICANTE\nPode prejudicar a integridade física, provocando amputações ou esmagamentos, perda de visão, fraturas que necessitem de intervenção cirúrgica ou que tenham elevado risco de causar incapacidade permanente, queimaduras que atinjam toda a face ou mais de 30% da superfície corporal ou outros agravos que resultem em incapacidade para as atividades habituais por meses.',
  [SeverityEnum.HIGH]:
    '5 — EXCESSIVA\nPode levar a óbito imediato ou que venha a ocorrer posteriormente.',
};

const SEVERITY_TOOLTIPS_BY_TYPE: Record<string, Record<SeverityEnum, string>> = {
  QUI: CHEMICAL_PHYSICAL_SEVERITY_TOOLTIPS,
  FIS: CHEMICAL_PHYSICAL_SEVERITY_TOOLTIPS,
  BIO: BIOLOGICAL_SEVERITY_TOOLTIPS,
  ERG: ERGONOMIC_SEVERITY_TOOLTIPS,
  ACI: ACCIDENT_SEVERITY_TOOLTIPS,
  OUTROS: CHEMICAL_PHYSICAL_SEVERITY_TOOLTIPS,
};

const SEVERITY_VALUES = [
  SeverityEnum.LOW,
  SeverityEnum.MEDIUM_LOW,
  SeverityEnum.MEDIUM,
  SeverityEnum.MEDIUM_HIGH,
  SeverityEnum.HIGH,
];

const buildSeverityRadioOptions = (tooltips: Record<SeverityEnum, string>) =>
  SEVERITY_VALUES.map((severity) => ({
    value: String(severity),
    content: String(severity),
    tooltip: tooltips[severity],
  }));

export const AI_SUGGESTION_SUPPORTED_RISK_TYPES = [
  'QUI',
  'FIS',
  'BIO',
  'ERG',
  'ACI',
  'OUTROS',
] as const;

export const isAiSuggestionSupportedRiskType = (type?: string): boolean =>
  AI_SUGGESTION_SUPPORTED_RISK_TYPES.includes(
    (type ?? '').trim().toUpperCase() as (typeof AI_SUGGESTION_SUPPORTED_RISK_TYPES)[number],
  );

export const getRiskFactorSeverityRadioOptions = (type?: string) => {
  const normalizedType = (type ?? 'QUI').trim().toUpperCase();
  const tooltips =
    SEVERITY_TOOLTIPS_BY_TYPE[normalizedType] ?? CHEMICAL_PHYSICAL_SEVERITY_TOOLTIPS;

  return buildSeverityRadioOptions(tooltips);
};

/** @deprecated Use getRiskFactorSeverityRadioOptions('QUI') */
export const CHEMICAL_RISK_SEVERITY_RADIO_OPTIONS =
  getRiskFactorSeverityRadioOptions('QUI');
