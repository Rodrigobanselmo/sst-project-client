import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

/** Colunas do RiskTool que suportam arrastar itens de cadastro. */
export type RiskCatalogDndKind =
  | 'generateSource'
  | 'eng'
  | 'adm'
  | 'rec'
  | 'epi';

export const RISK_CATALOG_DND_ITEM_TYPE = 'RISK_CATALOG_ITEM';

export type RiskCatalogDndDragItem = {
  kind: RiskCatalogDndKind;
  /** Fator de risco de origem (catálogo). */
  sourceRiskId: string;
  /** Nome exibido / texto de busca no Adicionar. */
  name: string;
  /** Id do cadastro no fator de origem (quando houver). */
  catalogId?: string | number;
  /** EPI — busca por CA. */
  ca?: string;
  medType?: MedTypeEnum | string;
  recType?: RecTypeEnum | string;
};

export const RISK_CATALOG_DND_KIND_LABEL: Record<RiskCatalogDndKind, string> = {
  generateSource: 'fonte geradora',
  eng: 'medida de engenharia (EPC/ENG)',
  adm: 'medida administrativa',
  rec: 'recomendação',
  epi: 'EPI',
};

export const RISK_CATALOG_DND_KIND_LABEL_PLURAL: Record<
  RiskCatalogDndKind,
  string
> = {
  generateSource: 'fontes geradoras',
  eng: 'medidas de engenharia (EPC/ENG)',
  adm: 'medidas administrativas',
  rec: 'recomendações',
  epi: 'EPIs',
};

export const RISK_CATALOG_BATCH_COPY_TOOLTIP: Record<RiskCatalogDndKind, string> =
  {
    generateSource: 'Copiar todas as fontes geradoras',
    eng: 'Copiar todas as medidas de engenharia',
    adm: 'Copiar todas as medidas administrativas',
    rec: 'Copiar todas as recomendações',
    epi: 'Copiar todos os EPIs',
  };

export const RISK_CATALOG_BATCH_EMPTY_MESSAGE: Record<RiskCatalogDndKind, string> =
  {
    generateSource: 'Nenhuma fonte geradora cadastrada.',
    eng: 'Não há medidas de engenharia para copiar.',
    adm: 'Não há medidas administrativas para copiar.',
    rec: 'Não há recomendações para copiar.',
    epi: 'Não há EPIs para copiar.',
  };

export type RiskCatalogBatchSession = {
  kind: RiskCatalogDndKind;
  sourceRiskId: string;
  sourceRiskName: string;
  items: RiskCatalogDndDragItem[];
};

export type RiskCatalogPulseTarget = {
  riskId: string;
  kind: RiskCatalogDndKind;
};

export type RiskCatalogCopyItemResult =
  | { status: 'already_attached' }
  | {
      status: 'attach_existing';
      match: { id: string | number; name?: string; [key: string]: unknown };
    }
  | { status: 'create_and_attach' }
  | { status: 'epi_missing' }
  | { status: 'invalid' };

export type RiskCatalogBatchStats = {
  kind: RiskCatalogDndKind;
  totalItems: number;
  added: number;
  existedInCatalog: number;
  created: number;
  alreadyAttached: number;
  epiMissing: number;
  failed: number;
};
