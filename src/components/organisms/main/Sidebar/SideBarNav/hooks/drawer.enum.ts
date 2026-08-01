/**
 * Chaves estáveis dos itens do drawer.
 *
 * Órfãos conhecidos (definidos no mapa, não renderizados em nenhuma seção):
 * - companyGroups, checklist, allCompaniesData, companiesData, companyPage
 * - biologicalIndicatorsGroup, esocialTable27
 * Mantidos no enum para evitar quebra de referências; limpeza agressiva fica
 * para fase posterior após confirmação de que nenhuma rota/legado os usa.
 */
export enum DrawerItemsEnum {
  dashboard = 'dashboard',
  profile = 'profile',
  documents = 'documents',
  team = 'team',
  accessGroups = 'accessGroups',
  /** Órfão — não renderizado. */
  companyGroups = 'companyGroups',
  /** Órfão — não renderizado. */
  checklist = 'checklist',
  importExportData = 'importExportData',
  catalogEquivalences = 'catalogEquivalences',
  frpsExplainabilityLibrary = 'frpsExplainabilityLibrary',
  /** Órfão — substituído por Bases de curadoria / Risco × Exame. */
  biologicalIndicatorsGroup = 'biologicalIndicatorsGroup',
  systemStandardsGroup = 'systemStandardsGroup',
  curationBasesGroup = 'curationBasesGroup',
  eligibilityAnalysisGroup = 'eligibilityAnalysisGroup',
  biologicalIndicators = 'biologicalIndicators',
  /** Órfão — usar esocialProcedures (curados). */
  esocialTable27 = 'esocialTable27',
  esocialProcedures = 'esocialProcedures',
  acgihBeiIndicators = 'acgihBeiIndicators',
  acgihBeiComparison = 'acgihBeiComparison',
  acgihBeiPromotionPreview = 'acgihBeiPromotionPreview',
  acgihBeiRiskCorrelation = 'acgihBeiRiskCorrelation',
  examRiskRules = 'examRiskRules',
  riskSubTypeCuration = 'riskSubTypeCuration',
  /** Órfão — dashboard já cobre Empresas para MASTER/consultoria. */
  allCompaniesData = 'allCompaniesData',
  allClinicsData = 'allClinicsData',
  oneClinicsData = 'oneClinicsData',
  /** Órfão — substituído por companyManagementCompanyData. */
  companiesData = 'companiesData',
  /**
   * Home operacional extra (MASTER/consultoria com empresa na rota).
   * Candidato a remoção futura se coincidir funcionalmente com Dados da Empresa.
   */
  companyHome = 'companyHome',
  /** Órfão — tela legada. */
  companyPage = 'companyPage',
  companyManagementEmployees = 'companyManagementEmployees',
  companyManagementCompanyData = 'companyManagementCompanyData',
  companyManagementCharacterization = 'companyManagementCharacterization',
  companyManagementDocuments = 'companyManagementDocuments',
  actionPlan = 'actionPlan',
  professionals = 'professionals',
  exams = 'exams',
  risks = 'risks',
  episAndCa = 'episAndCa',
  hoMethodsGroup = 'hoMethodsGroup',
  hoMethods = 'hoMethods',
  schedule = 'schedule',
  esocial = 'esocial',
  absenteeism = 'absenteeism',
  cat = 'cat',
  block = 'block',
  report = 'report',
  /**
   * Legado `/empregados` (não `/novo/empregados`).
   * Removido da sidebar nesta reorganização; rota canônica é Gestão → Funcionários.
   * Enum preservado para referência até confirmação de ausência de outros usos.
   */
  employee = 'employee',
  /** Grupo antigo “Cadastro” sob Atalhos — não renderizado como seção. */
  registers = 'registers',
  /** Grupo antigo “Ações Rápidas” sob Atalhos — não renderizado como seção. */
  actions = 'actions',
  forms = 'forms',
}
