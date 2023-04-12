import { useCallback, useMemo } from 'react';

import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { initialClinicExamsViewState } from 'components/organisms/modals/ModalViewClinicExams';
import { initialProfessionalViewState } from 'components/organisms/modals/ModalViewProfessional';
import { initialScheduleBlockViewState } from 'components/organisms/modals/ModalViewScheduleBlocks/ModalViewScheduleBlocks';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import SDoctorIcon from 'assets/icons/SDoctorIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SExamIcon from 'assets/icons/SExamIcon';
import SManagerSystemIcon from 'assets/icons/SManagerSystemIcon';
import { SScheduleBlockIcon } from 'assets/icons/SScheduleBlockIcon/SScheduleBlockIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ProfessionalFilterTypeEnum } from 'core/constants/maps/professionals-filter.map';
import { ClinicActionEnum } from 'core/enums/company-action.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useAccess } from '../useAccess';
import { useAppSelector } from '../useAppSelector';
import { useGetCompanyId } from '../useGetCompanyId';
import { usePushRoute } from '../usePushRoute';

export const useClinicStep = () => {
  const { isValidRoles, isValidPermissions } = useAccess();
  const { userCompanyId } = useGetCompanyId();
  const { data: userCompany } = useQueryCompany(userCompanyId);

  const onFilterBase = useCallback(
    (item: ISActionButtonProps) => {
      if (!isValidRoles(item?.roles)) return false;
      if (!isValidPermissions(item?.permissions)) return false;
      if (item.showIf) {
        let show = false;
        // eslint-disable-next-line prettier/prettier
      if (!show) show = !!(item.showIf.isClinic && userCompany.isClinic);
        // eslint-disable-next-line prettier/prettier
      if (!show)  show = !!(item.showIf.isConsulting && userCompany.isConsulting );
        // eslint-disable-next-line prettier/prettier
      if (!show) show = !!(item.showIf.isCompany && !userCompany.isConsulting && !userCompany.isClinic );

        if (!show) show = !!(item.showIf.isAbs && userCompany.absenteeism);
        if (!show) show = !!(item.showIf.isCat && userCompany.cat);
        if (!show)
          show = !!(item.showIf.isDocuments && userCompany.isDocuments);
        if (!show) show = !!(item.showIf.isEsocial && userCompany.esocial);
        if (!show) show = !!(item.showIf.isSchedule && userCompany.schedule);

        if (!show) return false;
      }

      return true;
    },
    [
      isValidPermissions,
      isValidRoles,
      userCompany.absenteeism,
      userCompany.cat,
      userCompany.esocial,
      userCompany.isClinic,
      userCompany.isConsulting,
      userCompany.isDocuments,
      userCompany.schedule,
    ],
  );

  const { data: company, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const dispatch = useAppDispatch();
  const stepLocal = useAppSelector(selectStep(company.id));
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthSuccess } = useAuthShow();

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

  const handleEditCompany = useCallback(() => {
    onOpenModal(ModalEnum.CLINIC_EDIT, company);
  }, [company, onOpenModal]);

  const handleAddProfessionals = useCallback(() => {
    onOpenModal(ModalEnum.PROFESSIONAL_SELECT, {
      // query: { byCouncil: true },
      isClinic: true,
      toEdit: true,
      doctorResponsibleId: company.doctorResponsibleId,
      filter: ProfessionalFilterTypeEnum.MEDICINE,
      title: 'Profissionais da saúde',
    } as typeof initialProfessionalViewState);
  }, [onOpenModal, company]);

  const handleAddExams = useCallback(() => {
    onOpenModal(
      ModalEnum.CLINIC_EXAMS_SELECT,
      {} as typeof initialClinicExamsViewState,
    );
  }, [onOpenModal]);

  const handleAddTeam = useCallback(() => {
    onOpenModal(ModalEnum.USER_VIEW);
  }, [onOpenModal]);

  const handleAddScheduleBlocks = useCallback(() => {
    onOpenModal(ModalEnum.SCHEDULE_BLOCK_SELECT, {
      toEdit: true,
    } as typeof initialScheduleBlockViewState);
  }, [onOpenModal]);

  const actionsMapStepMemo = useMemo(() => {
    const actions: Record<ClinicActionEnum, ISActionButtonProps> = {
      [ClinicActionEnum.USERS]: {
        type: ClinicActionEnum.USERS,
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Acesso de Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
      },
      [ClinicActionEnum.EDIT]: {
        type: ClinicActionEnum.EDIT,
        icon: SEditIcon,
        onClick: handleEditCompany,
        text: 'Editar Dados da Clínica',
      },
      [ClinicActionEnum.PROFESSIONALS]: {
        type: ClinicActionEnum.PROFESSIONALS,
        icon: SDoctorIcon,
        onClick: handleAddProfessionals,
        text: 'Profissionais da Saúde',
      },
      [ClinicActionEnum.EXAMS]: {
        type: ClinicActionEnum.EXAMS,
        icon: SExamIcon,
        onClick: handleAddExams,
        text: 'Exames Realizados',
      },
      [ClinicActionEnum.SCHEDULE_BLOCKS]: {
        type: ClinicActionEnum.SCHEDULE_BLOCKS,
        icon: SScheduleBlockIcon,
        onClick: handleAddScheduleBlocks,
        text: 'Bloquear Agenda',
      },
    };

    return actions;
  }, [
    handleAddTeam,
    handleEditCompany,
    handleAddProfessionals,
    handleAddExams,
    handleAddScheduleBlocks,
  ]);

  const nextStepMemo = useMemo(() => {
    if (step === CompanyStepEnum.USERS)
      return [
        {
          ...actionsMapStepMemo[ClinicActionEnum.USERS],
          active: true,
          text: 'Cadastrar Usuários',
        },
      ];

    if (step === CompanyStepEnum.EXAMS)
      return [
        {
          ...actionsMapStepMemo[ClinicActionEnum.EXAMS],
          text: 'Cadastrar Exames',
          sx: { backgroundColor: 'error.dark' },
          success: true,
        },
      ];

    if (step === CompanyStepEnum.PROFESSIONALS)
      return [
        {
          ...actionsMapStepMemo[ClinicActionEnum.PROFESSIONALS],
          text: 'Cadastrar Profissionais da Saúde',
          sx: { backgroundColor: 'success.dark' },
          primary: true,
        },
      ];

    return null;
  }, [actionsMapStepMemo, step]);

  const actionsStepMemo = useMemo(() => {
    const steps = [
      {
        ...actionsMapStepMemo[ClinicActionEnum.EDIT],
      },
      {
        ...actionsMapStepMemo[ClinicActionEnum.PROFESSIONALS],
      },
      {
        ...actionsMapStepMemo[ClinicActionEnum.EXAMS],
      },
      {
        ...actionsMapStepMemo[ClinicActionEnum.USERS],
      },
    ].filter((action) => onFilterBase(action));

    if (isAuthSuccess({ permissions: [PermissionEnum.SCHEDULE_BLOCK] }))
      steps.push(actionsMapStepMemo[ClinicActionEnum.SCHEDULE_BLOCKS] as any);

    return steps;
  }, [actionsMapStepMemo, isAuthSuccess, onFilterBase]);

  const nextStep = () => {
    const cantJump = [] as CompanyStepEnum[];

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
    nextStepMemo,
    actionsStepMemo,
    company,
    isLoading,
    nextStep,
  };
};
