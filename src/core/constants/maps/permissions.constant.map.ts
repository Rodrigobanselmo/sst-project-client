/* eslint-disable quotes */
import { PermissionEnum } from 'project/enum/permission.enum';

export interface IPermissionsOption {
  value: PermissionEnum;
  label: string;
  info: string;
  crud?: string[]; // c r u d p
}
interface IPermissionsOptions
  extends Record<PermissionEnum, IPermissionsOption> {}

export const permissionsConstantMap = {
  [PermissionEnum.MASTER]: {
    value: PermissionEnum.MASTER,
    label: 'Master',
    info: 'Acesso complemento a plataforma',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.USER]: {
    value: PermissionEnum.USER,
    label: 'Gerenciamento de usuários',
    info: 'Acesso ao gerenciamento de usuários',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ACCESS_GROUP]: {
    value: PermissionEnum.ACCESS_GROUP,
    label: 'Grupos de permissões',
    info: 'Acesso ao gerenciamento dos grupos de permissões',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.PROFESSIONALS]: {
    value: PermissionEnum.PROFESSIONALS,
    label: 'Gerenciamento dos profissionais',
    info: 'Gerenciamento dos profissionais da empresa (tecnicos, engenheiros, medicos e etc)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.COMPANY]: {
    value: PermissionEnum.COMPANY,
    label: 'Dados da Empresa',
    info: 'Acesso aos dados de cadastro da empresa (Não possui acesso a gestão de risco)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EMPLOYEE]: {
    value: PermissionEnum.EMPLOYEE,
    label: 'Gerenciamento de funcionários',
    info: 'Acesso aos dados de cadastro da funcionário',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EMPLOYEE_HISTORY]: {
    value: PermissionEnum.EMPLOYEE_HISTORY,
    label: 'Histórico do funcionários',
    info: 'Gerenciamento do historico do funcionário (exames e lotação)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.COMPANY_SCHEDULE]: {
    value: PermissionEnum.COMPANY_SCHEDULE,
    label: 'Agendamento de Exames',
    info: 'Agendamento de exames nas clínicas cadastradas',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EPI]: {
    value: PermissionEnum.EPI,
    label: "EPI's",
    info: "Gerenciamento dos EPI's",
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.RISK]: {
    value: PermissionEnum.RISK,
    label: 'Fatores de risco',
    info: 'Gerenciamento dos Fatores de risco e perigos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.GS]: {
    value: PermissionEnum.GS,
    label: 'Fonte geradora',
    info: 'Gerenciamento das Fontes Geradoras dos riscos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.REC_MED]: {
    value: PermissionEnum.REC_MED,
    label: 'Recomendações e medidas de controle',
    info: 'Gerenciamento das recomendações e medidas de controle referente aos riscos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.RISK_DATA]: {
    value: PermissionEnum.RISK_DATA,
    label: 'Gestão de riscos da empresa',
    info: "Poder vincular fatores de risco, fonte geradora, exames e etc aos cargos e GSE's da empresa",
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.PGR]: {
    value: PermissionEnum.PGR,
    label: 'Módulo PGR (Visualizar e gerar novos documentos)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ACTION_PLAN]: {
    value: PermissionEnum.ACTION_PLAN,
    label: 'Plano de ação (PGR)',
    info: 'Somente o gerenciamento do plano de ação da empresa',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.TASK]: {
    value: PermissionEnum.TASK,
    label: 'Projetos e tarefas',
    info: 'Gerenciamento dos projetos e tarefas da empresa',
    crud: ['r', 'cud'],
  },
  [PermissionEnum.ACTION_PLAN_PHOTOS]: {
    value: PermissionEnum.ACTION_PLAN_PHOTOS,
    label: 'Fotos do plano de ação',
    info: 'Gerenciamento das fotos do plano de ação da empresa',
    crud: ['r', 'cud'],
  },
  [PermissionEnum.CHARACTERIZATION]: {
    value: PermissionEnum.CHARACTERIZATION,
    label: 'Caracterização do Ambiente',
    info: 'Gerenciamento dos ambientes, posto de trabalho, atividades e etc da empresa',
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.PCMSO]: {
    value: PermissionEnum.PCMSO,
    label: 'Módulo PCMSO (Visualizar e gerar novos documentos)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EXAM]: {
    value: PermissionEnum.EXAM,
    label: 'Exames',
    info: 'gerenciamento dos exames cadastrados da empresa',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.EXAM_RISK]: {
    value: PermissionEnum.EXAM_RISK,
    label: 'Exames / Riscos',
    info: 'gerenciamento dos exames padrões cadastrados nos riscos das empresas',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.EXAM_CLINIC]: {
    value: PermissionEnum.EXAM_CLINIC,
    label: 'Exames / Clínicas',
    info: 'gerenciamento dos exames cadastrados nas clínicas para agendamentos',
    crud: ['c', 'r', 'u', 'd'],
  },
  // [PermissionEnum.RISK_DOC_INFO]: {
  //   value: PermissionEnum.RISK_DOC_INFO,
  //   label: 'Relevância dos Risco',
  //   info: 'Pode alterar para qual documentos o risco irá fazer parte',
  //   crud: ['r', 'cu'],
  // },
  [PermissionEnum.CLINIC_SCHEDULE]: {
    value: PermissionEnum.CLINIC_SCHEDULE,
    label: 'Controle de Agendamento (Clínica)',
    info: 'gerenciamento de exames pela clínica',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.HOMO_GROUP]: {
    value: PermissionEnum.HOMO_GROUP,
    label: 'GSE',
    info: 'gerenciamento dos grupos similares de exposição',
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.RISK_DOC_INFO]: {
    value: PermissionEnum.RISK_DOC_INFO,
    label: 'Relação de riscos nos documentos',
    info: 'Possivel definir para qual documento o risco identificado na empresa irá',
    crud: ['r', 'cu'],
  },
  [PermissionEnum.COMPANY_GROUPS]: {
    value: PermissionEnum.COMPANY_GROUPS,
    label: 'Grupo Empresarial',
    info: 'Gerenciamento dos grupos empresariais',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.DOCUMENTS]: {
    value: PermissionEnum.DOCUMENTS,
    label: 'Documentos',
    info: 'Controle dos documentos da empresa (upload e vencimentos)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.CONTRACTS]: {
    value: PermissionEnum.CONTRACTS,
    label: 'Criação de Empresas',
    info: 'Criação de Empresas',
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.CLINIC]: {
    value: PermissionEnum.CLINIC,
    label: 'Clinicas',
    info: 'Criação e edição de dados da clínica',
    crud: ['r', 'cu', 'd'],
  },
  [PermissionEnum.EMPLOYEE_HISTORY_FILE]: {
    value: PermissionEnum.EMPLOYEE_HISTORY_FILE,
    label: 'Arquivos de exames',
    info: 'Controle dos arquivos vinculados aos exames (clínico e complementar) gerados pelas clínicas (upload e download)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.PROTOCOL]: {
    value: PermissionEnum.PROTOCOL,
    label: 'Protocolos (ASO)',
    info: 'Poder criar e editar protocolos que estarão presentes no ASO',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ESOCIAL]: {
    value: PermissionEnum.ESOCIAL,
    label: 'Eventos eSocial',
    info: 'Poder emitir e enviar eventos (XML)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.PROF_RESP]: {
    value: PermissionEnum.PROF_RESP,
    label: 'Profissionais Responsáveis Monitoramento',
    info: 'Gerenciamento dos profissionais responsáveis monitoramento',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.CAT]: {
    value: PermissionEnum.CAT,
    label: 'CAT (eSocial)',
    info: 'Gerenciamento CAT (eSocial)',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ABSENTEEISM]: {
    value: PermissionEnum.ABSENTEEISM,
    label: 'Absenteísmo / Afastamento Temporario',
    info: 'Controle das ausências dos colaboradores durante o expediente de trabalho',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.SCHEDULE_BLOCK]: {
    value: PermissionEnum.SCHEDULE_BLOCK,
    label: 'Bloquear Prestadores (Feriados e etc...)',
    info: 'Pode bloquear a disponibilidade de dias específicos dos prestadores em caso de feriados e adversidades',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.ALERT]: {
    value: PermissionEnum.ALERT,
    label: 'Gerenciar Alertas (Emails...)',
    info: 'Pode gerenciar quem deverá receber os alertas por email',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.DOCUMENT_MODEL]: {
    value: PermissionEnum.DOCUMENT_MODEL,
    label: 'Criar e editar modelos de documentos',
    info: 'Pode gerenciar modelos de documentos',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.CLINIC_COMPANY_LINK]: {
    value: PermissionEnum.CLINIC_COMPANY_LINK,
    label: 'Vincular Clínicas prestadoras de serviços as empresas',
    info: 'Informar para quais empresas as clínicas irão prestar serviços',
    crud: ['c', 'r', 'u', 'd'],
  },
  [PermissionEnum.SCHEDULE_MEDICAL_VISIT]: {
    value: PermissionEnum.SCHEDULE_MEDICAL_VISIT,
    label: 'Gerenciar Visitas Médicas',
    info: 'Pode gerenciar as visitas médicas',
    crud: ['c', 'r', 'u', 'd'],
  },
} as IPermissionsOptions;

export const CRUD_LIST = [
  { type: 'r', text: 'Ler' },
  { type: 'c', text: 'Criar' },
  { type: 'u', text: 'Editar' },
  { type: 'cu', text: 'Criar e Editar' },
  { type: 'cud', text: 'Criar, Editar e Remover' },
  { type: 'd', text: 'Remover' },
];
