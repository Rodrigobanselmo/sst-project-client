import {
  CompanyRiskMatrixStatusEnum,
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixYAxisDirectionEnum,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export const RISK_MATRIX_STATUS_LABELS: Record<
  CompanyRiskMatrixStatusEnum,
  string
> = {
  [CompanyRiskMatrixStatusEnum.ACTIVE]: 'ACTIVE',
  [CompanyRiskMatrixStatusEnum.ARCHIVED]: 'ARCHIVED',
};

export const RISK_MATRIX_VERSION_STATUS_LABELS: Record<
  CompanyRiskMatrixVersionStatusEnum,
  string
> = {
  [CompanyRiskMatrixVersionStatusEnum.DRAFT]: 'DRAFT',
  [CompanyRiskMatrixVersionStatusEnum.PUBLISHED]: 'Publicada',
};

export const RISK_MATRIX_PUBLISH_CONFIRMATION = {
  title: 'Publicar versão?',
  message:
    'Após a publicação, esta versão não poderá mais ser editada. Alterações futuras deverão ser feitas em uma nova versão. A publicação não disponibiliza automaticamente a matriz nos estabelecimentos.',
  confirmText: 'Publicar versão',
  cancelText: 'Cancelar',
} as const;

export const RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE =
  'Salve o rascunho antes de publicar.';

export const RISK_MATRIX_COVERAGE_LABELS: Record<
  RiskMatrixCoverageKeyEnum,
  string
> = {
  [RiskMatrixCoverageKeyEnum.FIS]: 'FIS',
  [RiskMatrixCoverageKeyEnum.QUI]: 'QUI',
  [RiskMatrixCoverageKeyEnum.BIO]: 'BIO',
  [RiskMatrixCoverageKeyEnum.ACI]: 'ACI',
  [RiskMatrixCoverageKeyEnum.ERG]: 'ERG',
  // Abreviação visual do produto (SUBTYPE_CHIP_BY_NAME / SRiskChip): PSIC.
  [RiskMatrixCoverageKeyEnum.PSICOSOCIAL]: 'PSIC',
};

export const RISK_MATRIX_COVERAGE_OPTIONS: Array<{
  value: RiskMatrixCoverageKeyEnum;
  code: string;
  title: string;
}> = [
  {
    value: RiskMatrixCoverageKeyEnum.FIS,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.FIS],
    title: 'Físico',
  },
  {
    value: RiskMatrixCoverageKeyEnum.QUI,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.QUI],
    title: 'Químico',
  },
  {
    value: RiskMatrixCoverageKeyEnum.BIO,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.BIO],
    title: 'Biológico',
  },
  {
    value: RiskMatrixCoverageKeyEnum.ACI,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.ACI],
    title: 'Acidente',
  },
  {
    value: RiskMatrixCoverageKeyEnum.ERG,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.ERG],
    title: 'Ergonômico',
  },
  {
    value: RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
    code: RISK_MATRIX_COVERAGE_LABELS[RiskMatrixCoverageKeyEnum.PSICOSOCIAL],
    title: 'Psicossocial',
  },
];

export const RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS = [
  { value: 1, label: '1 — Muito Baixo' },
  { value: 2, label: '2 — Baixo' },
  { value: 3, label: '3 — Moderado' },
  { value: 4, label: '4 — Alto' },
  { value: 5, label: '5 — Muito Alto' },
] as const;

export const RISK_MATRIX_SIMPLE_SST_HELP =
  'Indica quais faixas da escala padrão SimpleSST correspondem a esta classificação. É uma ponte de compatibilidade com funcionalidades que trabalham com os níveis 1 a 5 e não altera o cálculo desta matriz.';

export const RISK_MATRIX_ORIENTATION_OPTIONS = [
  {
    value: RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
    label: 'Probabilidade no eixo X / Severidade no eixo Y',
  },
  {
    value: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    label: 'Severidade no eixo X / Probabilidade no eixo Y',
  },
] as const;

export const RISK_MATRIX_Y_AXIS_DIRECTION_OPTIONS = [
  {
    value: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
    label: '1 no topo → 5 embaixo',
  },
  {
    value: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    label: '5 no topo → 1 embaixo',
  },
] as const;

export const RISK_MATRIX_COVERAGE_TITLES: Record<
  RiskMatrixCoverageKeyEnum,
  string
> = {
  [RiskMatrixCoverageKeyEnum.FIS]: 'Físico',
  [RiskMatrixCoverageKeyEnum.QUI]: 'Químico',
  [RiskMatrixCoverageKeyEnum.BIO]: 'Biológico',
  [RiskMatrixCoverageKeyEnum.ACI]: 'Acidente',
  [RiskMatrixCoverageKeyEnum.ERG]: 'Ergonômico',
  [RiskMatrixCoverageKeyEnum.PSICOSOCIAL]: 'Psicossocial',
};

export const RISK_MATRIX_AVAILABILITY_DISCLAIMER =
  'Disponibilizar uma matriz não altera avaliações já realizadas.';

export const RISK_MATRIX_SIMPLESST_ALWAYS_AVAILABLE =
  'O padrão SimpleSST permanece disponível.';

export const RISK_MATRIX_MANAGE_AVAILABILITY_ACTION =
  'Gerenciar disponibilidade';

export const RISK_MATRIX_DUPLICATE_CONFIRMATION = {
  title: 'Duplicar matriz?',
  message:
    'Será criada uma nova matriz em rascunho com a mesma metodologia. A original permanece inalterada e os estabelecimentos não são copiados.',
  confirmText: 'Duplicar',
  cancelText: 'Cancelar',
} as const;

export const RISK_MATRIX_CREATE_SOURCE_HELP =
  'A opção “A partir do Padrão SimpleSST” cria uma cópia editável nesta empresa. O padrão do sistema permanece inalterado.';
