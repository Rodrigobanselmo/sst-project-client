import { useCallback, useMemo } from 'react';

import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { useQueryAbsenteeisms } from 'core/services/hooks/queries/useQueryAbsenteeisms/useQueryAbsenteeisms';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { initialModalImportExport } from 'components/organisms/modals/ModalImportExport/hooks/useModalImportExport';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { setGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import { SIconForm } from '@v2/assets/icons/modules/SIconForm/SIconForm';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { FormApplicationStatusTranslate } from '@v2/models/form/translations/form-application-status.translation';
import { useFetchBrowseFormApplication } from '@v2/services/forms/form-application/browse-form-application/hooks/useFetchBrowseFormApplication';
import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';
import { readFormApplication } from '@v2/services/forms/form-application/read-form-application/service/read-form-application.service';
import { isFormReminderEligible } from '@v2/services/forms/form-participants/send-form-reminder';
import { useFetch } from '@v2/hooks/api/useFetch';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { browseActionPlan } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.service';
import { useFetchReadAbsenteeismTimelineTotal } from '@v2/services/absenteeism/dashboard/read-absenteeism-timeline-total/hooks/useFetchReadAbsenteeismTimelineTotal';
import SAbsenteeismIcon from 'assets/icons/SAbsenteeismIcon';
import { SActionPlanIcon } from 'assets/icons/SActionPlanIcon';
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

import { useFetchCompanyGroupHomeSummary } from '@v2/services/enterprise/company-group/home-summary/hooks/useFetchCompanyGroupHomeSummary';
import { useFetchConsolidatedViewEligibility } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewEligibility';
import { ConsolidatedViewEligibleSetModel } from '@v2/models/enterprise/company-group/consolidated-view-eligibility.model';
import { HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE } from 'core/constants/home-business-group-scope.constants';
import { useHomeBusinessGroupScope } from 'core/hooks/useHomeBusinessGroupScope';
import {
  getHomeCompanyLabel,
  getHomeFormCompanyLabel,
} from 'core/hooks/action-steps/home-form-company-label';
import { selectHomeFormApplicationsToShow } from 'core/hooks/action-steps/home-form-applications-selection';

import { useAccess } from '../useAccess';
import { useAppSelector } from '../useAppSelector';
import { usePushRoute } from '../actions-push/usePushRoute';
import { initialProtocolRiskState } from 'components/organisms/modals/ModalEditProtocolRisk/hooks/useEditProtocols';
import SProtocolIcon from 'assets/icons/SProtocolIcon';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';

const getHomeFormParticipationPercent = (
  totalAnswers: number,
  totalParticipants: number,
): number => {
  if (!totalParticipants || totalParticipants <= 0) return 0;
  return Math.min(100, (totalAnswers / totalParticipants) * 100);
};

export const useCompanyStep = () => {
  const { onAccessFilterBase } = useAccess();
  const {
    isGroupConsolidated,
    businessGroupId,
    routeCompanyId,
    businessGroupName,
  } = useHomeBusinessGroupScope();
  const { data: company, isLoading } = useQueryCompany();
  const { summary: groupSummary, isLoading: isLoadingGroupSummary } =
    useFetchCompanyGroupHomeSummary(
      { companyGroupId: businessGroupId ?? 0 },
      {
        enabled: isGroupConsolidated && !!businessGroupId,
      },
    );
  const { eligibility: consolidatedViewEligibility } =
    useFetchConsolidatedViewEligibility(
      { companyGroupId: businessGroupId ?? 0 },
      {
        enabled: isGroupConsolidated && !!businessGroupId,
      },
    );
  const hasCompany = !!company?.id;
  const homeMetrics = useMemo(() => {
    if (isGroupConsolidated && groupSummary) {
      return {
        employeeCount: groupSummary.employees.active,
        employeeInactiveCount: groupSummary.employees.inactive,
        employeeAwayCount: groupSummary.employees.away,
        hierarchyCount: groupSummary.companyData.hierarchies,
        workspaceLength: groupSummary.companyData.workspaces,
        clinicsConnectedCount: groupSummary.companyData.clinicsConnected,
        riskCount: groupSummary.characterization.risks,
        examsCount: groupSummary.characterization.exams,
        protocolsCount: groupSummary.characterization.protocols,
        characterizationCount: groupSummary.characterization.environments,
        episCount: groupSummary.characterization.epis,
        homogenousGroupCount: groupSummary.characterization.homogeneousGroups,
        lastDocumentVersion: undefined,
      };
    }

    return {
      employeeCount: company.employeeCount,
      employeeInactiveCount: company.employeeInactiveCount,
      employeeAwayCount: company.employeeAwayCount,
      hierarchyCount: company.hierarchyCount,
      workspaceLength: company.workspace?.length || 0,
      clinicsConnectedCount: company.clinicsConnectedCount,
      riskCount: company.riskCount,
      examsCount: company.examsCount,
      protocolsCount: company.protocolsCount,
      characterizationCount: company.characterizationCount,
      episCount: company.episCount,
      homogenousGroupCount: company.homogenousGroupCount,
      lastDocumentVersion: company.lastDocumentVersion,
    };
  }, [company, groupSummary, isGroupConsolidated]);
  const formsBrowseCompanyId = routeCompanyId || company.id;
  const consolidatedFormsFilters = isGroupConsolidated
    ? {
        companyGroupScope: 'consolidated' as const,
        companyGroupId: businessGroupId ?? undefined,
      }
    : undefined;
  const actionPlanWorkspaceIds = useMemo(
    () => (company.workspace || []).map((ws) => ws.id).filter(Boolean),
    [company.workspace],
  );

  const { count: absenteeismTotalCount } = useQueryAbsenteeisms(
    1,
    {},
    1,
    isGroupConsolidated ? '' : company.id,
  );
  const { formApplication: formsTotal } = useFetchBrowseFormApplication(
    {
      companyId: formsBrowseCompanyId,
      pagination: { page: 1, limit: 1 },
      filters: consolidatedFormsFilters,
    },
    { enabled: hasCompany },
  );
  const { formApplication: formsRelevant } = useFetchBrowseFormApplication(
    {
      companyId: formsBrowseCompanyId,
      pagination: { page: 1, limit: 100 },
      orderBy: [
        {
          field: FormApplicationOrderByEnum.UPDATED_AT,
          order: 'desc',
        },
      ],
      filters: consolidatedFormsFilters,
    },
    { enabled: hasCompany },
  );
  const selectedFormsToShow = useMemo(
    () =>
      selectHomeFormApplicationsToShow(formsRelevant?.results || [], {
        isGroupConsolidated,
      }),
    [formsRelevant?.results, isGroupConsolidated],
  );
  const selectedFormIds = useMemo(
    () => selectedFormsToShow.map((item) => item.id),
    [selectedFormsToShow],
  );
  const { data: selectedFormsDetailsById } = useFetch<
    Record<
      string,
      {
        averageTimeSpent: number | null;
        reminderCount: number;
        isShareableLink: boolean;
      }
    >
  >({
    queryKey: [
      QueryEnum.COMPANY,
      'home-forms-details-by-id',
      company.id,
      selectedFormIds,
    ],
    enabled: hasCompany && !isGroupConsolidated && selectedFormIds.length > 0,
    queryFn: async () => {
      const details = await Promise.all(
        selectedFormIds.map(async (applicationId) => {
          const application = await readFormApplication({
            companyId: company.id,
            applicationId,
          });

          return {
            applicationId,
            averageTimeSpent: application.averageTimeSpent,
            reminderCount: application.reminderCount ?? 0,
            isShareableLink: application.isShareableLink,
          };
        }),
      );

      return details.reduce(
        (acc, item) => ({
          ...acc,
          [item.applicationId]: {
            averageTimeSpent: item.averageTimeSpent,
            reminderCount: item.reminderCount,
            isShareableLink: item.isShareableLink,
          },
        }),
        {} as Record<
          string,
          {
            averageTimeSpent: number | null;
            reminderCount: number;
            isShareableLink: boolean;
          }
        >,
      );
    },
  });
  const formatAverageTime = useCallback((seconds?: number | null) => {
    if (!seconds || seconds <= 0) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  }, []);
  const { data: absenteeismTimelineTotal } = useFetchReadAbsenteeismTimelineTotal(
    {
      companyId: company.id,
    },
    { enabled: hasCompany && !isGroupConsolidated },
  );
  const absenteeismLostDaysTotal = useMemo(
    () =>
      absenteeismTimelineTotal?.results?.reduce(
        (acc, item) => acc + Number(item.days || 0),
        0,
      ) ?? 0,
    [absenteeismTimelineTotal?.results],
  );
  const { data: actionPlanSummary } = useFetch<{
    total: number;
    pending: number;
    progress: number;
    done: number;
    canceled: number;
  } | null>({
    queryKey: [
      QueryEnum.COMPANY,
      'home-action-plan-summary',
      company.id,
      actionPlanWorkspaceIds,
    ],
    enabled: hasCompany && !isGroupConsolidated && actionPlanWorkspaceIds.length > 0,
    queryFn: async () => {
      const countByStatus = async (status?: ActionPlanStatusEnum) => {
        const totals = await Promise.all(
          actionPlanWorkspaceIds.map(async (workspaceId) => {
            try {
              const result = await browseActionPlan({
                companyId: company.id,
                workspaceId,
                pagination: { page: 1, limit: 1 },
                ...(status ? { filters: { status: [status] } } : {}),
              });
              return result.pagination.total || 0;
            } catch {
              return 0;
            }
          }),
        );

        return totals.reduce((acc, n) => acc + n, 0);
      };

      const [total, pending, progress, done, canceled] = await Promise.all([
        countByStatus(),
        countByStatus(ActionPlanStatusEnum.PENDING),
        countByStatus(ActionPlanStatusEnum.PROGRESS),
        countByStatus(ActionPlanStatusEnum.DONE),
        countByStatus(ActionPlanStatusEnum.CANCELED),
      ]);

      return { total, pending, progress, done, canceled };
    },
  });

  const actionPlanCompletionPercent = useMemo(() => {
    const total = actionPlanSummary?.total ?? 0;
    const done = actionPlanSummary?.done ?? 0;
    if (total === 0) return 0;
    return Math.min(100, (done / total) * 100);
  }, [actionPlanSummary?.done, actionPlanSummary?.total]);

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
    const tabWorkspaceId = query.tabWorkspaceId as string | undefined;
    const activeTab = query.active as string | undefined;
    const nextQuery: Record<string, string> = {};
    if (tabWorkspaceId) nextQuery.tabWorkspaceId = tabWorkspaceId;
    if (activeTab) nextQuery.active = activeTab;

    void push({
      pathname: RoutesEnum.OS.replace(':companyId', company.id),
      query: nextQuery,
    });
  }, [company.id, push, query.active, query.tabWorkspaceId]);

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
      pathname: RoutesEnum.COMPANY_SST.replace(':companyId', company.id),
      query: { active: '2' },
    });
  }, [company.id, push]);

  const handleGoActionPlan = useCallback(() => {
    if (isGroupConsolidated) {
      enqueueSnackbar(HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE, {
        variant: 'info',
      });
      return;
    }

    push({
      pathname: RoutesEnum.ACTION_PLAN.replace(':companyId', company.id),
    });
  }, [company.id, enqueueSnackbar, isGroupConsolidated, push]);

  const handleGoForms = useCallback(() => {
    push({
      pathname: PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
        '[companyId]',
        company.id,
      ).replace('[formTab]', FORM_TAB_ENUM.APPLIED),
    });
  }, [company.id, push]);

  const handleChangeStage = useCallback(
    (stage: string) => {
      if (isGroupConsolidated) {
        enqueueSnackbar(HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE, {
          variant: 'info',
        });
        return;
      }

      const nextQuery = { ...query };
      delete nextQuery.stage;
      delete nextQuery.active;

      void push(
        {
          pathname: pathname
            .replace('[companyId]', query.companyId as string)
            .replace('[stage]', stage),
          query: nextQuery,
        },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [enqueueSnackbar, isGroupConsolidated, pathname, push, query],
  );

  const handleAddTeam = useCallback(() => {
    onStackOpenModal(ModalEnum.USER_VIEW);
  }, [onStackOpenModal]);

  const primaryConsolidatedEligibleSet = useMemo<
    ConsolidatedViewEligibleSetModel | null
  >(() => {
    if (!consolidatedViewEligibility?.hasEligibleSet) {
      return null;
    }

    return (
      [...consolidatedViewEligibility.eligibleSets].sort(
        (left, right) => right.applications.length - left.applications.length,
      )[0] ?? null
    );
  }, [consolidatedViewEligibility]);

  const formsLaunchGroup = useMemo(() => {
    const applications = selectedFormsToShow.map((application) => {
      const details = selectedFormsDetailsById?.[application.id];
      const isAcceptingResponses =
        application.status === FormApplicationStatusEnum.PROGRESS;

      const groupParticipationPercent = getHomeFormParticipationPercent(
        Number(application.totalAnswers) || 0,
        Number(application.totalParticipants) || 0,
      );
      const isBusinessGroupApplication =
        application.isBusinessGroupApplication ?? false;
      const currentCompanyParticipationPercent =
        isGroupConsolidated || !isBusinessGroupApplication
          ? undefined
          : getHomeFormParticipationPercent(
              Number(application.currentCompanyAnswers) || 0,
              Number(application.currentCompanyParticipants) || 0,
            );

      const averageTimeSpent =
        details?.averageTimeSpent ?? application.averageTimeSpent ?? null;

      return {
        id: application.id,
        companyId: application.companyId,
        companyLabel: getHomeFormCompanyLabel(application, {
          isGroupConsolidated,
          businessGroupName,
        }),
        name: application.name || application.form?.name || 'Formulário',
        status: application.status,
        statusLabel: FormApplicationStatusTranslate[application.status],
        participationPercent: groupParticipationPercent,
        isBusinessGroupApplication,
        currentCompanyParticipationPercent,
        reminderCount: details?.reminderCount ?? 0,
        isAcceptingResponses,
        isShareableLink: details?.isShareableLink ?? true,
        canSendReminder:
          !isGroupConsolidated &&
          details != null &&
          isFormReminderEligible({
            isAcceptingResponses,
            isShareableLink: details.isShareableLink,
          }),
        infos: [
          { label: 'Respostas', value: application.totalAnswers ?? '--' },
          {
            label: 'Participantes',
            value: application.totalParticipants ?? '--',
          },
          {
            label: 'Tempo médio',
            value: formatAverageTime(averageTimeSpent),
          },
        ],
      };
    });

    const consolidatedViewHref =
      isGroupConsolidated &&
      businessGroupId &&
      primaryConsolidatedEligibleSet &&
      primaryConsolidatedEligibleSet.applications.length >= 2
        ? PageRoutes.FORMS.CONSOLIDATED_VIEW.LIST.replace(
            '[companyId]',
            formsBrowseCompanyId,
          ) +
          `?businessGroupId=${businessGroupId}&applicationIds=${primaryConsolidatedEligibleSet.applications
            .map((application) => application.applicationId)
            .join(',')}`
        : null;

    return {
      applications,
      isEmpty:
        applications.length === 0 &&
        (formsTotal?.pagination?.total ?? 0) === 0,
      emptyMessage: 'Sem formulários aplicados',
      onViewAll: handleGoForms,
      isGroupConsolidated,
      consolidatedViewHref,
      consolidatedViewLabel: 'Ver consolidação do grupo',
    };
  }, [
    businessGroupId,
    businessGroupName,
    formatAverageTime,
    formsBrowseCompanyId,
    formsTotal?.pagination?.total,
    handleGoForms,
    primaryConsolidatedEligibleSet,
    selectedFormsDetailsById,
    selectedFormsToShow,
    isGroupConsolidated,
  ]);

  const actionsMapStepMemo = useMemo(() => {
    const pgr = homeMetrics.lastDocumentVersion?.find(
      (l) => l.documentData.type == DocumentTypeEnum.PGR,
    )?.created_at;

    const pcmso = homeMetrics.lastDocumentVersion?.find(
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
        text: 'Acervo Técnico',
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
        icon: SActionPlanIcon,
        onClick: handleGoActionPlan,
        text: 'Plano de Ação',
        tooltipText: 'Gerenciamento do plano de ação da empresa',
        permissions: [PermissionEnum.ACTION_PLAN],
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
        permissions: [PermissionEnum.ABSENTEEISM],
        showIf: {
          isAbs: true,
        },
        infos: [
          { label: 'Registros', value: absenteeismTotalCount || 0 },
          { label: 'Afastados ativos', value: company.employeeAwayCount || 0 },
        ],
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
        nextStepLabel: 'Elementos Caracterizados',
        text: 'Elementos Caracterizados',
        tooltipText:
          'Cadastre ambientes, atividades, postos de trabalho, equipamentos e visões gerais utilizados na caracterização do PGR.',
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
          { label: 'Ativos', value: homeMetrics.employeeCount || 0 },
          { label: 'Inativos', value: homeMetrics.employeeInactiveCount || 0 },
          { label: 'Afastados', value: homeMetrics.employeeAwayCount || 0 },
        ],
      },
      [CompanyActionEnum.SST_GROUP_PAGE]: {
        type: CompanyActionEnum.SST_GROUP_PAGE,
        icon: SRiskFactorIcon,
        onClick: () => handleChangeStage(CompanyActionEnum.SST_GROUP_PAGE),
        text: 'Caracterização',
        tooltipText:
          'Caracterização dos riscos, exames e elementos caracterizados da empresa',
        roles: [],
        permissions: [],
        infos: [
          { label: 'Riscos', value: homeMetrics.riskCount || 0 },
          { label: 'Exames', value: homeMetrics.examsCount || 0 },
          { label: 'Protocolos', value: homeMetrics.protocolsCount || 0 },
          {
            label: 'Ambientes',
            value: homeMetrics.characterizationCount || 0,
          },
          { label: 'EPIs', value: homeMetrics.episCount || 0 },
          { label: 'GSE', value: homeMetrics.homogenousGroupCount || 0 },
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
          { label: 'Cargos', value: homeMetrics.hierarchyCount || 0 },
          { label: 'Estabelecimentos', value: homeMetrics.workspaceLength || 0 },
          {
            label: 'Clínicas Vinculadas',
            value: homeMetrics.clinicsConnectedCount || 0,
          },
        ],
      },
      [CompanyActionEnum.DOCUMENTS_GROUP_PAGE]: {
        type: CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
        icon: SDocumentIcon,
        onClick: () =>
          handleChangeStage(CompanyActionEnum.DOCUMENTS_GROUP_PAGE),
        text: 'Programas e Laudos',
        showIf: {
          isDocuments: true,
        },
        tooltipText: isGroupConsolidated
          ? 'Selecione uma empresa para ver programas e laudos'
          : 'Geração de versões dos programas e laudos da empresa',
        roles: [],
        permissions: [],
        infos: [
          {
            label: 'PGR',
            value: isGroupConsolidated
              ? '--'
              : (pgr ? `ultima versão (${dateFromNow(pgr)})` : '') || '--',
          },
          {
            label: 'PCMSO',
            value: isGroupConsolidated
              ? '--'
              : (pcmso ? `ultima versão (${dateFromNow(pcmso)})` : '') || '--',
          },
        ],
      },
    };

    return actions;
  }, [
    homeMetrics,
    isGroupConsolidated,
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
    handleGoForms,
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
    absenteeismTotalCount,
  ]);

  const showFormsLaunchGroup = useMemo(
    () =>
      onFilterBase({
        showIf: { isForms: true },
      } as ISActionButtonProps),
    [onFilterBase],
  );

  const showActionPlanLaunchGroup = useMemo(
    () =>
      isGroupConsolidated &&
      onFilterBase(actionsMapStepMemo[CompanyActionEnum.ACTION_PLAN]),
    [actionsMapStepMemo, isGroupConsolidated, onFilterBase],
  );

  const actionPlanLaunchGroup = useMemo(() => {
    const summary = groupSummary?.actionPlan;
    if (!isGroupConsolidated || summary?.status !== 'available') {
      return null;
    }

    const companies = summary.companies
      .map((company) => {
        const completionPercent =
          company.total > 0
            ? Math.min(100, (company.done / company.total) * 100)
            : 0;

        return {
          companyId: company.companyId,
          companyLabel: getHomeCompanyLabel(company) ?? 'Empresa',
          total: company.total,
          pending: company.pending,
          started: company.started,
          done: company.done,
          canceled: company.canceled,
          completionPercent,
        };
      })
      .sort((a, b) => b.pending - a.pending || b.total - a.total);

    const completionPercent =
      summary.total > 0
        ? Math.min(100, (summary.done / summary.total) * 100)
        : 0;

    return {
      total: summary.total,
      pending: summary.pending,
      started: summary.started,
      done: summary.done,
      canceled: summary.canceled,
      completionPercent,
      companies,
      loading: isLoadingGroupSummary,
      onClick: handleGoActionPlan,
    };
  }, [
    groupSummary?.actionPlan,
    handleGoActionPlan,
    isGroupConsolidated,
    isLoadingGroupSummary,
  ]);

  const launchCardsMemo = useMemo(() => {
    const cards: ISActionButtonProps[] = [];

    if (!isGroupConsolidated) {
      cards.push({
        ...actionsMapStepMemo[CompanyActionEnum.ACTION_PLAN],
        participationPercent: actionPlanCompletionPercent,
        infos: [
          { label: 'Total', value: actionPlanSummary?.total ?? '--' },
          { label: 'Pendente', value: actionPlanSummary?.pending ?? '--' },
          { label: 'Iniciada', value: actionPlanSummary?.progress ?? '--' },
          { label: 'Concluída', value: actionPlanSummary?.done ?? '--' },
          { label: 'Cancelada', value: actionPlanSummary?.canceled ?? '--' },
        ],
      });
    }

    cards.push({
      ...actionsMapStepMemo[CompanyActionEnum.ABSENTEEISM],
      infos: isGroupConsolidated
        ? [
            { label: 'Registros', value: '--' },
            {
              label: 'Afastados ativos',
              value: homeMetrics.employeeAwayCount || 0,
            },
            { label: 'Dias perdidos', value: '--' },
          ]
        : [
            { label: 'Registros', value: absenteeismTotalCount || 0 },
            {
              label: 'Afastados ativos',
              value: company.employeeAwayCount || 0,
            },
            { label: 'Dias perdidos', value: absenteeismLostDaysTotal || 0 },
          ],
    });

    return cards.filter((action) => onFilterBase(action));
  }, [
    actionPlanCompletionPercent,
    actionPlanSummary?.canceled,
    actionPlanSummary?.done,
    actionPlanSummary?.pending,
    actionPlanSummary?.progress,
    actionPlanSummary?.total,
    actionsMapStepMemo,
    absenteeismLostDaysTotal,
    absenteeismTotalCount,
    company.employeeAwayCount,
    homeMetrics.employeeAwayCount,
    isGroupConsolidated,
    onFilterBase,
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
      {
        group: 'Lançamentos',
        items: [
          {
            ...actionsMapStepMemo[CompanyActionEnum.ACTION_PLAN],
            count: actionPlanSummary?.total || 0,
          },
          {
            ...actionsMapStepMemo[CompanyActionEnum.ABSENTEEISM],
            count: absenteeismTotalCount || 0,
          },
          {
            icon: SIconForm,
            onClick: handleGoForms,
            text: 'Formulários',
            tooltipText: 'Gerenciamento de formulários e questionários',
            permissions: [PermissionEnum.FORM],
            count: formsTotal?.pagination.total || 0,
            showIf: {
              isForms: true,
            },
          },
        ].filter((action) => onFilterBase(action)),
      },
    ];
  }, [
    actionPlanSummary?.total,
    actionsMapStepMemo,
    absenteeismTotalCount,
    formsTotal?.pagination.total,
    handleGoForms,
    onFilterBase,
  ]);

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
    isLoading: isLoading || (isGroupConsolidated && isLoadingGroupSummary),
    isGroupConsolidated,
    businessGroupName,
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
    launchCardsMemo,
    formsLaunchGroup,
    showFormsLaunchGroup,
    actionPlanLaunchGroup,
    showActionPlanLaunchGroup,
    actionsMapStepMemo,
  };
};

export type IUseCompanyStep = ReturnType<typeof useCompanyStep>;
