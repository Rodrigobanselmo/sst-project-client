import { useCallback, useMemo } from 'react';

import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { initialModalImportExport } from 'components/organisms/modals/ModalImportExport/hooks/useModalImportExport';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { RoleEnum } from 'project/enum/roles.enums';
import { setGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import SAbsenteeismIcon from 'assets/icons/SAbsenteeismIcon';
import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
import { SClinicIcon } from 'assets/icons/SClinicIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';
import SManagerSystemIcon from 'assets/icons/SManagerSystemIcon';
import SOsIcon from 'assets/icons/SOsIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';
import STeamIcon from 'assets/icons/STeamIcon';
import { SWorkspaceIcon } from 'assets/icons/SWorkspaceIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useMutReport } from 'core/services/hooks/mutations/reports/useMutReport/useMutReport';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { dateFromNow } from 'core/utils/date/date-format';

import { useAccess } from '../useAccess';
import { useAppSelector } from '../useAppSelector';
import { usePushRoute } from '../actions-push/usePushRoute';
import { initialProtocolRiskState } from 'components/organisms/modals/ModalEditProtocolRisk/hooks/useEditProtocols';
import SProtocolIcon from 'assets/icons/SProtocolIcon';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';

export const useCompanyStep = () => {
  const { onAccessFilterBase } = useAccess();
  // const { userCompanyId } = useGetCompanyId();
  // const { data: userCompany } = useQueryCompany(userCompanyId);
  const { data: company, isLoading } = useQueryCompany();

  const onFilterBase = useCallback(
    (item: ISActionButtonProps) => {
      return onAccessFilterBase(item, company);
    },
    [onAccessFilterBase, company],
  );

  const { onStackOpenModal } = useOpenRiskTool();
  const { push, pathname, query } = useRouter();
  const dispatch = useAppDispatch();
  const stepLocal = useAppSelector(selectStep(company.id));
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleAddWorkspace,
    handleAddEmployees,
    handleAddClinic,
    handleSetApplyServiceCompany,
    handleEditDocumentModel,
    handleAddCharacterization,
    handleOpenAddRiskModal,
    handleDocumentControl,
  } = usePushRoute();

  const uploadMutation = useMutUploadFile();
  const reportMutation = useMutReport();

  useFetchFeedback(isLoading && !company?.id);
  const step = useMemo(() => {
    if (!company) return null;

    const indexLocal = company?.steps?.findIndex(
      (step) => step === stepLocal?.companyStep,
    );
    const indexServer = company?.steps?.findIndex(
      (step) => step === company.step,
    );

    if ((indexLocal || 0) < (indexServer || 0)) return company.step;

    return (stepLocal || {})?.companyStep || company.step;
  }, [company, stepLocal]);

  // COMPANY
  const handleEditCompany = useCallback(() => {
    onStackOpenModal(ModalEnum.COMPANY_EDIT, company);
  }, [company, onStackOpenModal]);

  const handleAddProtocol = useCallback(() => {
    onStackOpenModal(ModalEnum.PROTOCOL_RISK, {
      callback: () =>
        queryClient.invalidateQueries([QueryEnum.COMPANY, company.id]),
    } as Partial<typeof initialProtocolRiskState>);
  }, [company.id, onStackOpenModal]);

  const handleUploadRisk = useCallback(() => {
    onStackOpenModal(ModalEnum.IMPORT_EXPORT_MODAL, {
      onDownload: async () => {
        await reportMutation.mutateAsync({
          type: ReportTypeEnum.MODEL_RISK,
          companyId: company.id,
        });
      },
      onConfirm: async ({ files }) => {
        await uploadMutation.mutateAsync({
          file: files[0],
          payload: {
            createRisk: true,
          },
          path: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
            ':companyId',
            company.id,
          ),
        });
      },
    } as Partial<typeof initialModalImportExport>);
  }, [company.id, onStackOpenModal, reportMutation, uploadMutation]);

  const handleAddManagerSystem = useCallback(() => {
    if (company.riskGroupCount) {
      push({
        pathname: RoutesEnum.MANAGER_SYSTEM.replace(':companyId', company.id),
      });
    } else {
      onStackOpenModal(ModalEnum.RISK_GROUP_ADD, {});
    }
  }, [company.id, company.riskGroupCount, onStackOpenModal, push]);

  // MODULES
  const handleDocPGR = useCallback(() => {
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title: 'Selecione o Sistema de Gestão SST do PGR',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.PGR_DOCUMENT.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onStackOpenModal, push]);

  const handleDocPCMSO = useCallback(() => {
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title: 'Selecione o Sistema de Gestão SST do PGR',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.PCMSO_DOCUMENT.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onStackOpenModal, push]);

  const handleCompanyRisks = useCallback(() => {
    push(RoutesEnum.COMPANY_RISKS.replace(/:companyId/g, company.id));
  }, [push, company.id]);

  const handleAbsenteeism = useCallback(() => {
    push(RoutesEnum.ABSENTEEISM.replace(/:companyId/g, company.id));
  }, [push, company.id]);

  const handleOs = useCallback(() => {
    push(RoutesEnum.OS.replace(/:companyId/g, company.id));
  }, [push, company.id]);

  const handleAddExam = useCallback(() => {
    onStackOpenModal(ModalEnum.EXAM_RISK_VIEW);
  }, [onStackOpenModal]);

  // SHORT_CUTS
  const handleAddRisk = useCallback(() => {
    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.RISK_DATA.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onStackOpenModal, push]);

  const handleGoHierarchy = useCallback(() => {
    if (company.workspace && company.workspace.length === 0)
      return enqueueSnackbar('Cadastre um estabelecimento antes de continuar', {
        variant: 'warning',
      });

    push(RoutesEnum.HIERARCHY.replace(':companyId', company.id || ''));
    dispatch(setGhoState({ hierarchies: [], data: null }));
    dispatch(setGhoOpen(false));
  }, [company.workspace, company.id, enqueueSnackbar, push, dispatch]);

  const handleGoGho = useCallback(() => {
    push({
      pathname: RoutesEnum.GHOS.replace(':companyId', company.id),
    });
  }, [company.id, push]);

  const handleGoActionPlan = useCallback(() => {
    push({
      pathname: RoutesEnum.ACTION_PLAN.replace(':companyId', company.id),
    });
  }, [company.id, push]);

  const handleChangeStage = useCallback(
    (stage: string) => {
      push(
        pathname
          .replace('[companyId]', query.companyId as string)
          .replace('[stage]', stage),
        undefined,
        {
          shallow: true,
        },
      );
    },
    [pathname, push, query.companyId],
  );

  const handleAddTeam = useCallback(() => {
    onStackOpenModal(ModalEnum.USER_VIEW);
  }, [onStackOpenModal]);

  const actionsMapStepMemo = useMemo(() => {
    const pgr = company?.lastDocumentVersion?.find(
      (l) => l.documentData.type == DocumentTypeEnum.PGR,
    )?.created_at;

    const pcmso = company?.lastDocumentVersion?.find(
      (l) => l.documentData.type == DocumentTypeEnum.PCSMO,
    )?.created_at;

    const actions: Record<CompanyActionEnum, ISActionButtonProps> = {
      [CompanyActionEnum.WORKSPACE]: {
        type: CompanyActionEnum.WORKSPACE,
        count: company.workspace?.length,
        nextStepLabel: 'Estabelecimentos',
        icon: SWorkspaceIcon,
        onClick: handleAddWorkspace,
        text: 'Cadastrar Estabelecimentos',
        tooltipText:
          'Estabelecimento é o local onde a empresa realiza suas atividades, podendo estar ser um local próprio ou de terceiros',
      },
      [CompanyActionEnum.EMPLOYEE]: {
        type: CompanyActionEnum.EMPLOYEE,
        count: company.employeeCount,
        icon: SEmployeeIcon,
        onClick: handleAddEmployees,
        nextStepLabel: 'Funcionários',
        text: 'Funcionários',
        tooltipText:
          'Cadastre os funcionários e seus respectivos cargos e setores através da importação de planilha excel ou pelo sistema diretamente ao organograma da empresa',
      },
      [CompanyActionEnum.USERS]: {
        type: CompanyActionEnum.USERS,
        icon: STeamIcon,
        count: company.usersCount,
        nextStepLabel: 'Usuários',
        onClick: handleAddTeam,
        text: 'Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
      },
      [CompanyActionEnum.DOCUMENTS]: {
        type: CompanyActionEnum.DOCUMENTS,
        icon: SDocumentIcon,
        onClick: handleDocumentControl,
        text: 'Documentos',
        tooltipText:
          'Centralização dos documentos da empresa e gerenciamento de vencimentos',
      },
      [CompanyActionEnum.EDIT]: {
        type: CompanyActionEnum.EDIT,
        icon: SEditIcon,
        onClick: handleEditCompany,
        text: 'Editar Dados da Empresa',
      },
      [CompanyActionEnum.HIERARCHY]: {
        type: CompanyActionEnum.HIERARCHY,
        icon: SHierarchyIcon,
        count: company.hierarchyCount,
        onClick: handleGoHierarchy,
        nextStepLabel: 'Cargos e Setores',
        text: 'Cargos e Setores',
      },
      [CompanyActionEnum.HOMO_GROUP]: {
        type: CompanyActionEnum.HOMO_GROUP,
        count: company.homogenousGroupCount,
        icon: SGhoIcon,
        onClick: handleGoGho,
        nextStepLabel: 'Grupos (GSE/GHO)',
        text: 'Grupos Similares de Exposição',
      },
      [CompanyActionEnum.ACTION_PLAN]: {
        type: CompanyActionEnum.ACTION_PLAN,
        count: 0,
        icon: SGhoIcon,
        onClick: handleGoActionPlan,
        nextStepLabel: 'Grupos (GSE/GHO)',
        text: 'Grupos Similares de Exposição',
      },
      [CompanyActionEnum.RISKS]: {
        type: CompanyActionEnum.RISKS,
        count: company.riskCount,
        icon: SRiskFactorIcon,
        onClick: handleAddRisk,
        nextStepLabel: 'Riscos, exames e EPIs',
        text: 'Vincular Riscos, exames e EPIs',
      },
      [CompanyActionEnum.RISKS_MODAL]: {
        type: CompanyActionEnum.RISKS_MODAL,
        count: company.riskCount,
        icon: SRiskFactorIcon,
        onClick: handleOpenAddRiskModal,
        nextStepLabel: 'Riscos, exames e EPIs',
        text: 'Vincular Riscos, exames e EPIs',
      },
      [CompanyActionEnum.RISK_GROUP]: {
        type: CompanyActionEnum.RISK_GROUP,
        count: company.riskGroupCount,
        icon: SManagerSystemIcon,
        onClick: handleAddManagerSystem,
        text: 'Sistema de Gestão',
        tooltipText:
          'É onde todos os dados para a Gestão SST ficam vinculados e é possível importa-lo em outras empresas. Recomenda-se ter somente um sistema de gestão por empresa',
      },
      [CompanyActionEnum.PGR]: {
        type: CompanyActionEnum.PGR,
        icon: SDocumentIcon,
        onClick: handleDocPGR,
        text: 'PGR (Documento)',
        tooltipText:
          'Alimentação de dados para geração de um documento PGR completo',
      },
      [CompanyActionEnum.PCMSO]: {
        type: CompanyActionEnum.PCMSO,
        icon: SDocumentIcon,
        onClick: handleDocPCMSO,
        text: 'PCMSO (Documento)',
        tooltipText:
          'Alimentação de dados para geração de um documento PCMSO completo',
      },
      [CompanyActionEnum.CLINICS]: {
        type: CompanyActionEnum.CLINICS,
        count: company.clinicsConnectedCount,
        icon: SClinicIcon,
        onClick: () => handleAddClinic(),
        nextStepLabel: 'Clínicas para atendimento',
        text: 'Clínicas Vinculadas',
        tooltipText:
          'Cadastro de clínicas que prestarão serviços a esta empresa',
        showIf: {
          isSchedule: true,
        },
      },
      [CompanyActionEnum.EXAMS_RISK]: {
        type: CompanyActionEnum.EXAMS_RISK,
        count: company.examsCount,
        icon: SExamIcon,
        onClick: handleAddExam,
        nextStepLabel: 'Exames ao risco',
        text: 'Relação de Exames',
        tooltipText: 'Cadastro de exames aos seus respectivos riscos',
        showIf: {
          isSchedule: true,
          isDocuments: true,
        },
      },
      [CompanyActionEnum.COMPANY_RISKS]: {
        type: CompanyActionEnum.COMPANY_RISKS,
        count: company.riskCount,
        icon: SRiskFactorIcon,
        onClick: handleCompanyRisks,
        text: 'Riscos Identificados',
        tooltipText:
          'Riscos Identificados na empresa e sua relevância para os documentos ',
      },
      [CompanyActionEnum.ABSENTEEISM]: {
        type: CompanyActionEnum.ABSENTEEISM,
        icon: SAbsenteeismIcon,
        onClick: handleAbsenteeism,
        text: 'Absenteísmo',
        tooltipText: 'Gerenciamento de faltas e afastamentos temporarios',
      },
      [CompanyActionEnum.OS]: {
        type: CompanyActionEnum.OS,
        icon: SOsIcon,
        onClick: handleOs,
        text: 'Editar Modelo (Ordem de Serviço)',
        tooltipText: 'Configuração e conteúdo da OS',
        showIf: {
          isDocuments: true,
        },
      },
      [CompanyActionEnum.APPLY_SERVICE_COMPANY]: {
        type: CompanyActionEnum.APPLY_SERVICE_COMPANY,
        icon: SManagerSystemIcon,
        onClick: () => handleSetApplyServiceCompany(),
        text: 'Quem Gerencia a Empresa?',
        tooltipText: 'Editar quem tem acesso a esta empresa',
        roles: [RoleEnum.MASTER],
      },
      [CompanyActionEnum.PROTOCOL]: {
        type: CompanyActionEnum.PROTOCOL,
        count: company.protocolsCount,
        nextStepLabel: 'Protocolos (ASO)',
        icon: SProtocolIcon,
        onClick: () => handleAddProtocol(),
        text: 'Protocolos (ASO)',
        tooltipText: 'Adicionar protocolos para incluir ao ASO',
        showIf: {
          isDocuments: true,
        },
      },

      [CompanyActionEnum.DOCUMENT_MODEL]: {
        type: CompanyActionEnum.DOCUMENT_MODEL,
        icon: SDocumentIcon,
        onClick: () => handleEditDocumentModel(company.id),
        text: 'Editar Modelos (PGR, PCMSO, etc...)',
        tooltipText: 'Criação e edição de modelos de documentos',
      },

      [CompanyActionEnum.CHARACTERIZATION]: {
        type: CompanyActionEnum.CHARACTERIZATION,
        count: company.characterizationCount,
        icon: SCharacterizationIcon,
        onClick: () => handleAddCharacterization(),
        nextStepLabel: 'Ambientes e Atividades',
        text: 'Ambientes e Atividades',
        tooltipText: 'Caracterização do Ambiente e Atividades da empresa',
      },

      [CompanyActionEnum.EMPLOYEES_GROUP_PAGE]: {
        type: CompanyActionEnum.EMPLOYEES_GROUP_PAGE,
        icon: SEmployeeIcon,
        onClick: () =>
          handleChangeStage(CompanyActionEnum.EMPLOYEES_GROUP_PAGE),
        text: 'Funcionários',
        tooltipText: 'Editar e visualizar status dos funcinários',
        roles: [],
        permissions: [],
        infos: [
          { label: 'Ativos', value: company.employeeCount || 0 },
          { label: 'Inativos', value: company.employeeInactiveCount || 0 },
          { label: 'Afastados', value: company.employeeAwayCount || 0 },
        ],
      },
      [CompanyActionEnum.SST_GROUP_PAGE]: {
        type: CompanyActionEnum.SST_GROUP_PAGE,
        icon: SRiskFactorIcon,
        onClick: () => handleChangeStage(CompanyActionEnum.SST_GROUP_PAGE),
        text: 'Caracterização',
        tooltipText: 'Caracterização dos riscos, exames e ambientes da empresa',
        roles: [],
        permissions: [],
        infos: [
          { label: 'Riscos', value: company.riskCount || 0 },
          { label: 'Exames', value: company.examsCount || 0 },
          { label: 'Protocolos', value: company.protocolsCount || 0 },
          { label: 'Ambientes', value: company.protocolsCount || 0 },
          { label: 'EPIs', value: company.episCount || 0 },
          { label: 'GSE', value: company.homogenousGroupCount || 0 },
        ],
      },
      [CompanyActionEnum.COMPANY_GROUP_PAGE]: {
        type: CompanyActionEnum.COMPANY_GROUP_PAGE,
        icon: SCompanyIcon,
        onClick: () => handleChangeStage(CompanyActionEnum.COMPANY_GROUP_PAGE),
        text: 'Dados Empresa',
        tooltipText: 'Editar dados da empresa e cadastro de estabelecimentos',
        roles: [],
        permissions: [],
        infos: [
          { label: 'Cargos', value: company.hierarchyCount || 0 },
          { label: 'Estabelecimentos', value: company.workspace?.length || 0 },
          {
            label: 'Clínicas Vinculadas',
            value: company.clinicsConnectedCount || 0,
          },
        ],
      },
      [CompanyActionEnum.DOCUMENTS_GROUP_PAGE]: {
        type: CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
        icon: SDocumentIcon,
        onClick: () =>
          handleChangeStage(CompanyActionEnum.DOCUMENTS_GROUP_PAGE),
        text: 'Documentos',
        showIf: {
          isDocuments: true,
        },
        tooltipText: 'Geração de versoes dos documentos da empresa',
        roles: [],
        permissions: [],
        infos: [
          {
            label: 'PGR',
            value: (pgr ? `ultima versão (${dateFromNow(pgr)})` : '') || '--',
          },
          {
            label: 'PCMSO',
            value:
              (pcmso ? `ultima versão (${dateFromNow(pcmso)})` : '') || '--',
          },
        ],
      },
    };

    return actions;
  }, [
    company?.lastDocumentVersion,
    company.workspace?.length,
    company.employeeCount,
    company.usersCount,
    company.hierarchyCount,
    company.homogenousGroupCount,
    company.riskCount,
    company.riskGroupCount,
    company.clinicsConnectedCount,
    company.examsCount,
    company.protocolsCount,
    company.characterizationCount,
    company.employeeInactiveCount,
    company.employeeAwayCount,
    company.episCount,
    company.id,
    handleAddWorkspace,
    handleAddEmployees,
    handleAddTeam,
    handleDocumentControl,
    handleEditCompany,
    handleGoHierarchy,
    handleGoGho,
    handleGoActionPlan,
    handleAddRisk,
    handleOpenAddRiskModal,
    handleAddManagerSystem,
    handleDocPGR,
    handleDocPCMSO,
    handleAddExam,
    handleCompanyRisks,
    handleAbsenteeism,
    handleOs,
    handleAddClinic,
    handleSetApplyServiceCompany,
    handleAddProtocol,
    handleEditDocumentModel,
    handleAddCharacterization,
    handleChangeStage,
  ]);

  const shortActionsStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
      actionsMapStepMemo[CompanyActionEnum.RISKS],
      actionsMapStepMemo[CompanyActionEnum.ABSENTEEISM],
    ].filter((action) => onFilterBase(action));
  }, [actionsMapStepMemo, onFilterBase]);

  const modulesStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.PGR],
      actionsMapStepMemo[CompanyActionEnum.COMPANY_RISKS],
      actionsMapStepMemo[CompanyActionEnum.OS],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const medicineStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.CLINICS],
      actionsMapStepMemo[CompanyActionEnum.EXAMS_RISK],
      actionsMapStepMemo[CompanyActionEnum.PCMSO],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const pageGroupMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.EMPLOYEES_GROUP_PAGE],
      actionsMapStepMemo[CompanyActionEnum.COMPANY_GROUP_PAGE],
      actionsMapStepMemo[CompanyActionEnum.SST_GROUP_PAGE],
      actionsMapStepMemo[CompanyActionEnum.DOCUMENTS_GROUP_PAGE],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const nextStepMemo = useMemo(() => {
    if (step === CompanyStepEnum.WORKSPACE)
      return [
        {
          ...actionsMapStepMemo[CompanyActionEnum.WORKSPACE],
          active: true,
        },
      ];

    if (step === CompanyStepEnum.EMPLOYEE)
      return [
        {
          ...actionsMapStepMemo[CompanyActionEnum.EMPLOYEE],
          text: 'Cadastrar Funcionários',
          sx: { backgroundColor: 'success.dark' },
          success: true,
        },
      ];

    if (step === CompanyStepEnum.HIERARCHY)
      return [
        {
          ...actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
          sx: { backgroundColor: 'info.main' },
          primary: true,
        },
      ];

    // if (step === CompanyStepEnum.HOMO_GROUP)
    //   return [
    //     {
    //       ...actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
    //       sx: { backgroundColor: 'info.main' },
    //       success: true,
    //     },
    //   ];

    if (
      step === CompanyStepEnum.RISK_GROUP ||
      step === CompanyStepEnum.HOMO_GROUP
    )
      return [
        {
          ...actionsMapStepMemo[CompanyActionEnum.RISK_GROUP],
          sx: { backgroundColor: 'warning.dark' },
          primary: true,
        },
      ];

    return [
      {
        ...actionsMapStepMemo[CompanyActionEnum.PGR],
        sx: { backgroundColor: 'primary.main' },
        success: true,
      },
    ];
  }, [actionsMapStepMemo, step]);

  const actionsStepMemo = useMemo(() => {
    return [
      {
        ...actionsMapStepMemo[CompanyActionEnum.EDIT],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.USERS],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.EMPLOYEE],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.DOCUMENTS],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.WORKSPACE],
      },
      {
        ...actionsMapStepMemo[CompanyActionEnum.APPLY_SERVICE_COMPANY],
      },
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const companyStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.EDIT],
      actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
      actionsMapStepMemo[CompanyActionEnum.CLINICS],
      actionsMapStepMemo[CompanyActionEnum.USERS],
      actionsMapStepMemo[CompanyActionEnum.APPLY_SERVICE_COMPANY],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const documentsStepMemo = useMemo(() => {
    return [actionsMapStepMemo[CompanyActionEnum.DOCUMENTS]].filter((action) =>
      onFilterBase(action),
    );
  }, [onFilterBase, actionsMapStepMemo]);

  const documentsModelsStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.DOCUMENT_MODEL],
      actionsMapStepMemo[CompanyActionEnum.OS],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const characterizationStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
      actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
      actionsMapStepMemo[CompanyActionEnum.CHARACTERIZATION],
    ].filter((action) => onFilterBase(action));
  }, [onFilterBase, actionsMapStepMemo]);

  const characterizationActionsStepMemo = useMemo(() => {
    return [actionsMapStepMemo[CompanyActionEnum.RISKS_MODAL]].filter(
      (action) => onFilterBase(action),
    );
  }, [onFilterBase, actionsMapStepMemo]);

  const stepsActions = useMemo(() => {
    if (company.workspace?.length === 0)
      return [
        { ...actionsMapStepMemo[CompanyActionEnum.WORKSPACE], active: true },
      ];

    const missingEmployee =
      company.employeeCount === 0 && company.employeeInactiveCount === 0;

    if (missingEmployee)
      return [
        actionsMapStepMemo[CompanyActionEnum.EMPLOYEE],
        actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
      ];

    return [
      ...(missingEmployee
        ? [actionsMapStepMemo[CompanyActionEnum.EMPLOYEE]]
        : []),
      ...(!company.hierarchyCount
        ? [actionsMapStepMemo[CompanyActionEnum.HIERARCHY]]
        : []),
      ...(!company.riskGroupCount
        ? [actionsMapStepMemo[CompanyActionEnum.RISK_GROUP]]
        : []),
      ...(!company.riskGroupCount
        ? [actionsMapStepMemo[CompanyActionEnum.USERS]]
        : []),
      actionsMapStepMemo[CompanyActionEnum.CHARACTERIZATION],
      actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
      actionsMapStepMemo[CompanyActionEnum.RISKS_MODAL],
    ].filter((action) => onFilterBase(action));
  }, [
    company.workspace?.length,
    company.employeeCount,
    company.employeeInactiveCount,
    company.hierarchyCount,
    company.riskGroupCount,
    actionsMapStepMemo,
    onFilterBase,
  ]);

  const stepsActionsList = useMemo(() => {
    return [
      {
        group: 'Cadastro',
        items: [
          {
            ...actionsMapStepMemo[CompanyActionEnum.WORKSPACE],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.EMPLOYEE],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.HIERARCHY],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.USERS],
          },
        ].filter((action) => onFilterBase(action)),
      },
      {
        group: 'Segurança',
        items: [
          {
            ...actionsMapStepMemo[CompanyActionEnum.CHARACTERIZATION],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.RISKS_MODAL],
          },
        ].filter((action) => onFilterBase(action)),
      },
      {
        group: 'Medicina',
        items: [
          {
            ...actionsMapStepMemo[CompanyActionEnum.CLINICS],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.EXAMS_RISK],
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.PROTOCOL],
          },
        ].filter((action) => onFilterBase(action)),
      },
    ];
  }, [actionsMapStepMemo, onFilterBase]);

  const nextStep = () => {
    const cantJump = [
      CompanyStepEnum.WORKSPACE,
      CompanyStepEnum.HIERARCHY,
      CompanyStepEnum.RISK_GROUP,
    ];

    if (step && cantJump.includes(step))
      return enqueueSnackbar('Você não pode pular essa etapa', {
        variant: 'warning',
      });

    const index = company.steps?.findIndex((s) => s === step);
    if (index === -1 || index === undefined) return;

    const nextStep = company.steps?.[index + 1];
    if (!nextStep) return;

    dispatch(setCompanyStep({ step: nextStep, companyId: company.id }));
  };

  const stage =
    pageGroupMemo.find((group) => group.type == (query.stage as string))
      ?.type || pageGroupMemo[0].type;

  return {
    shortActionsStepMemo,
    modulesStepMemo,
    nextStepMemo,
    actionsStepMemo,
    company,
    isLoading,
    nextStep,
    medicineStepMemo,
    handleUploadRisk,
    pageGroupMemo,
    stage,
    companyStepMemo,
    documentsStepMemo,
    documentsModelsStepMemo,
    query,
    characterizationStepMemo,
    characterizationActionsStepMemo,
    stepsActions,
    stepsActionsList,
    actionsMapStepMemo,
  };
};

export type IUseCompanyStep = ReturnType<typeof useCompanyStep>;
