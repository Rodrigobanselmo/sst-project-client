import { useCallback, useMemo } from 'react';

import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialClinicSelectState } from 'components/organisms/modals/ModalSelectClinics';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import {
  setGhoOpen,
  setGhoSearch,
  setGhoSearchSelect,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import { SClinicIcon } from 'assets/icons/SClinicIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';
import SManagerSystemIcon from 'assets/icons/SManagerSystemIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';
import STeamIcon from 'assets/icons/STeamIcon';
import { SWorkspaceIcon } from 'assets/icons/SWorkspaceIcon';

import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutSetClinicsCompany } from 'core/services/hooks/mutations/manager/company/useMutSetClinicsCompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useAppSelector } from '../useAppSelector';

export const useCompanyStep = () => {
  const { data: company, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const stepLocal = useAppSelector(selectStep(company.id));
  const { enqueueSnackbar } = useSnackbar();

  const setClinicsMutation = useMutSetClinicsCompany();

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
    onOpenModal(ModalEnum.COMPANY_EDIT, company);
  }, [company, onOpenModal]);

  const handleEditDocuments = useCallback(() => {
    onOpenModal(ModalEnum.DOCUMENTS_VIEW, company);
  }, [company, onOpenModal]);

  const handleAddWorkspace = useCallback(() => {
    const data: Partial<typeof initialWorkspaceState> = {
      name: company.type,
      cep: company?.address?.cep,
      number: company?.address?.number,
      city: company?.address?.city,
      complement: company?.address?.complement,
      state: company?.address?.state,
      street: company?.address?.street,
      neighborhood: company?.address?.neighborhood,
    };

    const isFirstWorkspace = company.workspace && company.workspace.length == 0;
    onOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, onOpenModal]);

  const handleAddEmployees = useCallback(() => {
    if (!company.employeeCount && !company.hierarchyCount) {
      onOpenModal(ModalEnum.EMPLOYEES_EXCEL_ADD);
    } else {
      push({
        pathname: RoutesEnum.EMPLOYEES.replace(':companyId', company.id),
      });
    }
  }, [
    company.employeeCount,
    company.hierarchyCount,
    company.id,
    onOpenModal,
    push,
  ]);

  const handleAddManagerSystem = useCallback(() => {
    if (company.riskGroupCount) {
      push({
        pathname: RoutesEnum.MANAGER_SYSTEM.replace(':companyId', company.id),
      });
    } else {
      onOpenModal(ModalEnum.RISK_GROUP_ADD, {});
    }
  }, [company.id, company.riskGroupCount, onOpenModal, push]);

  // MODULES
  const handleDocPGR = useCallback(() => {
    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title: 'Selecione o Sistema de Gestão SST do PGR',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.PGR_DOCUMENT.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onOpenModal, push]);

  const handleCompanyRisks = useCallback(() => {
    push(RoutesEnum.COMPANY_RISKS.replace(/:companyId/g, company.id));
  }, [push, company.id]);

  const handleAddClinic = useCallback(() => {
    onOpenModal(ModalEnum.CLINIC_SELECT, {
      title: 'Selecione as Clinicas',
      selected:
        company.clinicsAvailable?.map((clinics) => ({
          id: clinics.clinicId,
        })) || [],
      onSelect: (clinics: ICompany[]) =>
        setClinicsMutation.mutate(
          clinics.map((clinic) => ({
            clinicId: clinic.id,
            companyId: company.id,
          })),
        ),
      multiple: true,
    } as Partial<typeof initialClinicSelectState>);
  }, [company.clinicsAvailable, company.id, onOpenModal, setClinicsMutation]);

  const handleAddExam = useCallback(() => {
    onOpenModal(ModalEnum.EXAM_RISK_VIEW);
  }, [onOpenModal]);

  // SHORT_CUTS
  const handleAddRisk = useCallback(() => {
    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
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
  }, [company.id, onOpenModal, push]);

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
    if (company.workspace && company.workspace.length === 0)
      return enqueueSnackbar('Cadastre um estabelecimento antes de continuar', {
        variant: 'warning',
      });
    if (!company.hierarchyCount)
      return enqueueSnackbar('Cadastre um cargo antes de continuar', {
        variant: 'warning',
      });

    push(RoutesEnum.HIERARCHY.replace(':companyId', company.id || ''));
    dispatch(setGhoState({ hierarchies: [], data: null }));
    dispatch(setGhoOpen(true));
    dispatch(setGhoSearch(''));
    dispatch(setGhoSearchSelect(''));
  }, [
    company.workspace,
    company.hierarchyCount,
    company.id,
    enqueueSnackbar,
    push,
    dispatch,
  ]);

  const handleAddTeam = useCallback(() => {
    onOpenModal(ModalEnum.USER_VIEW);
  }, [onOpenModal]);

  const actionsMapStepMemo = useMemo(() => {
    return {
      [CompanyActionEnum.WORKSPACE]: {
        icon: SWorkspaceIcon,
        onClick: handleAddWorkspace,
        text: 'Cadastrar Estabelecimentos',
        tooltipText:
          'Estabelecimento é o local onde a empresa realiza suas atividades, podendo estar ser um local próprio ou de terceiros',
      },
      [CompanyActionEnum.EMPLOYEE]: {
        icon: SEmployeeIcon,
        onClick: handleAddEmployees,
        text: 'Funcionários',
        tooltipText:
          'Cadastre os funcionários e seus respectivos cargos e setores através da importação de planilha excel ou pelo sistema diretamente ao organograma da empresa',
      },
      [CompanyActionEnum.USERS]: {
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
      },
      [CompanyActionEnum.DOCUMENTS]: {
        icon: SDocumentIcon,
        onClick: handleEditDocuments,
        text: 'Documentos',
        tooltipText:
          'Centralização dos documentos da empresa e gerenciamento de vencimentos',
      },
      [CompanyActionEnum.EDIT]: {
        icon: SEditIcon,
        onClick: handleEditCompany,
        text: 'Editar Dados da Empresa',
      },
      [CompanyActionEnum.HIERARCHY]: {
        icon: SHierarchyIcon,
        onClick: handleGoHierarchy,
        text: 'Organograma',
      },
      [CompanyActionEnum.HOMO_GROUP]: {
        icon: SGhoIcon,
        onClick: handleGoGho,
        text: 'Grupos Similar de Exposição',
      },
      [CompanyActionEnum.RISKS]: {
        icon: SRiskFactorIcon,
        onClick: handleAddRisk,
        text: 'Vincular Fatores de Risco',
      },
      [CompanyActionEnum.RISK_GROUP]: {
        icon: SManagerSystemIcon,
        onClick: handleAddManagerSystem,
        text: 'Sistema de Gestão',
        tooltipText:
          'É onde todos os dados para a Gestão SST ficam vinculados e é possível importa-lo em outras empresas. Recomenda-se ter somente um sistema de gestão por empresa',
      },
      [CompanyActionEnum.PGR]: {
        icon: SDocumentIcon,
        onClick: handleDocPGR,
        text: 'PGR (Documento)',
        tooltipText:
          'Alimentação de dados para geração de um documento PGR completo',
      },
      [CompanyActionEnum.CLINICS]: {
        icon: SClinicIcon,
        onClick: handleAddClinic,
        text: 'Clínicas Cadastradas',
        tooltipText:
          'Cadastro de clínicas que prestarão serviços a esta empresa',
      },
      [CompanyActionEnum.EXAMS_RISK]: {
        icon: SExamIcon,
        onClick: handleAddExam,
        text: 'Exames',
        tooltipText: 'Cadastro de exames aos seus respectivos riscos',
      },
      [CompanyActionEnum.COMPANY_RISKS]: {
        icon: SRiskFactorIcon,
        onClick: handleCompanyRisks,
        text: 'Riscos Identificados',
        tooltipText:
          'Riscos Identificados na empresa e sua relevância para os documentos ',
      },
    };
  }, [
    handleAddWorkspace,
    handleAddEmployees,
    handleAddTeam,
    handleEditDocuments,
    handleEditCompany,
    handleGoHierarchy,
    handleGoGho,
    handleAddRisk,
    handleAddManagerSystem,
    handleDocPGR,
    handleAddClinic,
    handleAddExam,
    handleCompanyRisks,
  ]);

  const shortActionsStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
      actionsMapStepMemo[CompanyActionEnum.RISKS],
    ];
  }, [actionsMapStepMemo]);

  const modulesStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.PGR],
      actionsMapStepMemo[CompanyActionEnum.COMPANY_RISKS],
    ];
  }, [actionsMapStepMemo]);

  const medicineStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.CLINICS],
      actionsMapStepMemo[CompanyActionEnum.EXAMS_RISK],
    ];
  }, [actionsMapStepMemo]);

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

    if (step === CompanyStepEnum.HOMO_GROUP)
      return [
        {
          ...actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
          sx: { backgroundColor: 'info.main' },
          success: true,
        },
      ];

    if (step === CompanyStepEnum.RISK_GROUP)
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
    ];
  }, [actionsMapStepMemo]);

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

  return {
    shortActionsStepMemo,
    modulesStepMemo,
    nextStepMemo,
    actionsStepMemo,
    company,
    isLoading,
    nextStep,
    medicineStepMemo,
  };
};
