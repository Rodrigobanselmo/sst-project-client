import { useCallback, useMemo } from 'react';

import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { setGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import { SEmployeeIcon } from 'assets/icons/SEmployeeIcon';
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
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useAppSelector } from '../useAppSelector';

export const useCompanyStep = () => {
  const { data: company, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const stepLocal = useAppSelector(selectStep(company.id));
  const { enqueueSnackbar } = useSnackbar();

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
  }, [
    company.workspace,
    company.hierarchyCount,
    company.id,
    enqueueSnackbar,
    push,
    dispatch,
  ]);

  const handleAddTeam = useCallback(() => {
    push({
      pathname: RoutesEnum.TEAM.replace(':companyId', company.id),
    });
  }, [company.id, push]);

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
        text: 'Empregados',
        tooltipText:
          'Cadastre os empregados e seus respectivos cargos e setores através da importação de planilha excel ou pelo sistema diretamente ao organograma da empresa',
      },
      [CompanyActionEnum.USERS]: {
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
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
    };
  }, [
    handleAddWorkspace,
    handleAddEmployees,
    handleAddTeam,
    handleEditCompany,
    handleGoHierarchy,
    handleGoGho,
    handleAddRisk,
    handleAddManagerSystem,
    handleDocPGR,
  ]);

  const shortActionsStepMemo = useMemo(() => {
    return [
      actionsMapStepMemo[CompanyActionEnum.HOMO_GROUP],
      actionsMapStepMemo[CompanyActionEnum.RISKS],
    ];
  }, [actionsMapStepMemo]);

  const modulesStepMemo = useMemo(() => {
    return [actionsMapStepMemo[CompanyActionEnum.PGR]];
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
          text: 'Cadastrar Empregados',
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
  };
};
