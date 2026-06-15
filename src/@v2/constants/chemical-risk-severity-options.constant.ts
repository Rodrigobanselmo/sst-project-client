import { SeverityEnum } from 'project/enum/severity.enums';

const CHEMICAL_SEVERITY_TOOLTIPS: Record<SeverityEnum, string> = {
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

export const CHEMICAL_RISK_SEVERITY_RADIO_OPTIONS = [
  SeverityEnum.LOW,
  SeverityEnum.MEDIUM_LOW,
  SeverityEnum.MEDIUM,
  SeverityEnum.MEDIUM_HIGH,
  SeverityEnum.HIGH,
].map((severity) => ({
  value: String(severity),
  content: String(severity),
  tooltip: CHEMICAL_SEVERITY_TOOLTIPS[severity],
}));
