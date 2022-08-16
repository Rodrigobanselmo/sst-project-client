import { initialProbState } from 'components/organisms/modals/ModalAddProbability/hooks/useProbability';
import { initialEpiDataState } from 'components/organisms/modals/ModalEditEpiRiskData/hooks/useEditEpis';
import { initialExamDataState } from 'components/organisms/modals/ModalEditExamRiskData/hooks/useEditExams';
import { initialEngsRiskDataState } from 'components/organisms/modals/ModalEditMedRiskData/hooks/useEditEngsRisk';
import { useSnackbar } from 'notistack';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEpi, IEpiRiskData } from 'core/interfaces/api/IEpi';
import { IExam, IExamRiskData } from 'core/interfaces/api/IExam';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  IEngsRiskData,
  IRecMed,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import {
  IUpsertRiskData,
  useMutUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IHierarchyTreeMapObject } from '../components/RiskToolViews/RiskToolRiskView/types';

export const useColumnAction = () => {
  const upsertRiskData = useMutUpsertRiskData();
  const { getPathById } = useHierarchyTreeActions();
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const { onStackOpenModal } = useModal();

  const onHandleSelectSave = async (
    {
      recs,
      adms,
      engs,
      epis,
      generateSources,
      exams,
      ...restData
    }: IUpsertRiskData,
    riskData?: IRiskData,
    { keepEmpty } = { keepEmpty: false },
  ) => {
    const submitData = { ...restData } as IUpsertRiskData;

    Object.entries({ recs, adms, generateSources }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...value,
          ...((riskData as any)?.[key]?.map((rec: any) => rec.id) ?? []),
        ];
    });
    if (epis && epis?.length)
      submitData.epis = removeDuplicate(
        [
          ...epis,
          ...(riskData?.epis?.map((epi) => epi.epiRiskData) || []),
        ].filter((i) => i),
        { removeById: 'epiId' },
      );

    if (engs && engs?.length)
      submitData.engs = removeDuplicate(
        [
          ...engs,
          ...(riskData?.engs?.map((eng) => eng.engsRiskData) || []),
        ].filter((i) => i),
        { removeById: 'recMedId' },
      );

    if (exams && exams?.length)
      submitData.exams = removeDuplicate(
        [
          ...exams,
          ...(riskData?.exams?.map((eng) => eng.examsRiskData) || []),
        ].filter((i) => i),
        { removeById: 'examId' },
      );

    await upsertRiskData
      .mutateAsync({
        ...submitData,
        keepEmpty,
      })
      .catch(() => {});
  };

  const onHandleRemoveSave = async (
    {
      recs,
      adms,
      engs,
      epis,
      exams,
      generateSources,
      ...restData
    }: Partial<IUpsertRiskData>,
    riskData?: IRiskData,
  ) => {
    const submitData = { ...restData } as IUpsertRiskData;

    Object.entries({ recs, adms, generateSources }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...(
            (riskData as any)?.[key]?.filter(
              (data: any) => !(value as any).includes(data.id),
            ) ?? []
          ).map((d: any) => d.id),
        ];
    });

    if (epis && epis?.length) {
      submitData.epis = [
        ...(riskData?.epis
          ?.map((epi) => epi.epiRiskData)
          .filter(
            (epi) =>
              epi && epis.find((epiDelete) => epiDelete.epiId != epi.epiId),
          ) || []),
      ];
    }

    if (engs && engs?.length) {
      submitData.engs = [
        ...(riskData?.engs
          ?.map((engs) => engs.engsRiskData)
          .filter(
            (eng) =>
              eng &&
              engs.find((engsDelete) => engsDelete.recMedId != eng.recMedId),
          ) || []),
      ];
    }

    if (exams && exams?.length) {
      submitData.exams = [
        ...(riskData?.exams
          ?.map((exams) => exams.examsRiskData)
          .filter(
            (exam) =>
              exam &&
              exams.find((examsDelete) => examsDelete.examId != exam.examId),
          ) || []),
      ];
    }

    await upsertRiskData
      .mutateAsync({
        ...submitData,
      })
      .catch(() => {});
  };

  const onHandleHelp = async ({
    gho,
    risk,
    handleSelect,
  }: {
    risk?: IRiskFactors;
    handleSelect: (value: number) => void;
    gho: IGho | IHierarchyTreeMapObject | null;
  }) => {
    if (!gho?.id) return;

    const isHierarchy = !('workspaceIds' in gho);
    let workspaceIds = [] as string[];

    if (isHierarchy) workspaceIds = [String(getPathById(gho.id)[1])];
    else workspaceIds = gho.workspaceIds;

    const company = queryClient.getQueryData<ICompany>([
      QueryEnum.COMPANY,
      companyId,
    ]);

    if (!company) return;

    const workspaceEmployeesCount =
      company.workspace?.reduce(
        (acc, workspace) =>
          workspaceIds.includes(workspace.id)
            ? acc + (workspace?.employeeCount ?? 0)
            : acc,
        0,
      ) || 0;

    const handleSelectSync = (value: number) => {
      handleSelect(value);
      enqueueSnackbar(`A probabilidade sugerida pelo sistema é ${value}`, {
        variant: 'info',
        autoHideDuration: 5000,
        style: { transform: 'translateY(70px)' },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    };

    onStackOpenModal(ModalEnum.PROBABILITY_ADD, {
      employeeCountGho: isHierarchy ? 0 : gho.employeeCount,
      hierarchyId: isHierarchy ? gho.id.split('//')[0] : '',
      riskType: risk?.type,
      employeeCountTotal: workspaceEmployeesCount,
      onCreate: handleSelectSync,
    } as typeof initialProbState);
  };

  const onHandleEditEpi = async (
    epi: IEpi,
    handleSelect: (epis: IEpiRiskData[]) => void,
  ) => {
    onStackOpenModal(ModalEnum.EPI_EPI_DATA, {
      onSubmit: (epis) => epis?.epiRiskData && handleSelect([epis.epiRiskData]),
      ...epi,
    } as Partial<typeof initialEpiDataState>);
  };

  const onHandleEditEngs = async (
    eng: IRecMed,
    handleSelect: (engs: IEngsRiskData[]) => void,
  ) => {
    onStackOpenModal(ModalEnum.EPC_RISK_DATA, {
      onSubmit: (engs) =>
        engs?.engsRiskData && handleSelect([engs.engsRiskData]),
      ...eng,
    } as Partial<typeof initialEngsRiskDataState>);
  };

  const onHandleEditExams = async (
    exam: IExam,
    handleSelect: (exams: IExamRiskData[]) => void,
  ) => {
    onStackOpenModal(ModalEnum.EXAM_RISK_DATA, {
      onSubmit: (exams) =>
        exams?.examsRiskData && handleSelect([exams.examsRiskData]),
      ...exam,
      examRiskData: exam.examsRiskData,
    } as Partial<typeof initialExamDataState>);
  };

  return {
    onHandleSelectSave,
    upsertRiskData,
    onHandleHelp,
    onStackOpenModal,
    enqueueSnackbar,
    onHandleEditEngs,
    onHandleEditEpi,
    onHandleRemoveSave,
    onHandleEditExams,
  };
};
