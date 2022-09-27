import { useCallback, useMemo } from 'react';

import { initialClinicExamsViewState } from 'components/organisms/modals/ModalViewClinicExams';
import { initialProfessionalViewState } from 'components/organisms/modals/ModalViewProfessional';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CompanyStepEnum } from 'project/enum/company-step.enum';
import { selectStep, setCompanyStep } from 'store/reducers/step/stepSlice';

import SDoctorIcon from 'assets/icons/SDoctorIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SExamIcon from 'assets/icons/SExamIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ProfessionalFilterTypeEnum } from 'core/constants/maps/professionals-filter.map';
import { ClinicActionEnum } from 'core/enums/company-action.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useAppSelector } from '../useAppSelector';

export const useClinicStep = () => {
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

  const handleEditCompany = useCallback(() => {
    onOpenModal(ModalEnum.CLINIC_EDIT, company);
  }, [company, onOpenModal]);

  const handleAddProfessionals = useCallback(() => {
    onOpenModal(ModalEnum.PROFESSIONAL_SELECT, {
      isClinic: true,
      toEdit: true,
      filter: ProfessionalFilterTypeEnum.MEDICINE,
      title: 'Profissionais da saúde',
    } as typeof initialProfessionalViewState);
  }, [onOpenModal]);

  const handleAddExams = useCallback(() => {
    onOpenModal(
      ModalEnum.CLINIC_EXAMS_SELECT,
      {} as typeof initialClinicExamsViewState,
    );
  }, [onOpenModal]);

  const handleAddTeam = useCallback(() => {
    onOpenModal(ModalEnum.USER_VIEW);
  }, [onOpenModal]);

  const actionsMapStepMemo = useMemo(() => {
    return {
      [ClinicActionEnum.USERS]: {
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Acesso de Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
      },
      [ClinicActionEnum.EDIT]: {
        icon: SEditIcon,
        onClick: handleEditCompany,
        text: 'Editar Dados da Empresa',
      },
      [ClinicActionEnum.PROFESSIONALS]: {
        icon: SDoctorIcon,
        onClick: handleAddProfessionals,
        text: 'Profissionais da Saúde',
      },
      [ClinicActionEnum.EXAMS]: {
        icon: SExamIcon,
        onClick: handleAddExams,
        text: 'Exames Realizados',
      },
    };
  }, [
    handleAddTeam,
    handleEditCompany,
    handleAddProfessionals,
    handleAddExams,
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
    return [
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
    ];
  }, [actionsMapStepMemo]);

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
