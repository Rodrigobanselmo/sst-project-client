/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useState } from 'react';
import { useStore } from 'react-redux';

import { SButton } from 'components/atoms/SButton';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { STagButton } from 'components/atoms/STagButton';
import { initialProbState } from 'components/organisms/modals/ModalAddProbability/hooks/useProbability';
import { initialEpiDataState } from 'components/organisms/modals/ModalEditEpiRiskData/hooks/useEditEpis';
import { initialEngsRiskDataState } from 'components/organisms/modals/ModalEditMedRiskData/hooks/useEditEngsRisk';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import {
  selectGhoMultiDisabledIds,
  selectGhoMultiIds,
} from 'store/reducers/hierarchy/ghoMultiSlice';
import {
  selectRisk,
  selectRisks,
  setRiskAddState,
} from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IExam } from 'core/interfaces/api/IExam';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  IEngsRiskData,
  IRecMed,
  IRecMedCreate,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import {
  IDeleteManyRiskData,
  useMutDeleteManyRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutDeleteManyRiskData';
import {
  IUpsertManyRiskData,
  useMutUpsertManyRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertManyRiskData';
import {
  IUpsertRiskData,
  useMutUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { queryClient } from 'core/services/queryClient';
import { getMatrizRisk } from 'core/utils/helpers/matriz';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { useColumnAction } from '../../../hooks/useColumnAction';
import { useRowColumns } from '../../../hooks/useRowColumns';
import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { AdmColumn } from '../components/columns/AdmColumn';
import { EngColumn } from '../components/columns/EngColumn';
import { EpiColumn } from '../components/columns/EpiColumn';
import { ProbabilityAfterColumn } from '../components/columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from '../components/columns/ProbabilityColumn';
import { RecColumn } from '../components/columns/RecColumn';
import { SourceColumn } from '../components/columns/SourceColumn';
import { RowColumns } from '../components/RowColumns';
import { STGridItem } from '../styles';
import { IRiskDataRow } from '../types';
import { SideTableMultipleProps } from './types';

const initialState: IRiskDataRow = { id: '' };

export const SideRowTableMulti: FC<SideTableMultipleProps> = ({
  viewDataType,
  riskGroupId,
  isRepresentAll,
}) => {
  // const selectedRiskStore = useAppSelector(selectRisk);
  const selectedRisks = useAppSelector(selectRisks);
  const dispatch = useAppDispatch();
  const selectedRiskStore: IRiskFactors | null = selectedRisks[0];

  const store = useStore();
  const { companyId } = useGetCompanyId();
  const { query } = useRouter();
  const upsertManyMut = useMutUpsertManyRiskData();
  const deleteManyMut = useMutDeleteManyRiskData();
  const [riskData, setRiskData] = useState<IRiskDataRow>(initialState);
  const { columns } = useRowColumns();
  const {
    enqueueSnackbar,
    onHandleEditEpi,
    onHandleEditEngs,
    onHandleEditExams,
    onStackOpenModal,
  } = useColumnAction();

  const isHierarchy = viewDataType == ViewsDataEnum.HIERARCHY;
  const isSelected = false;

  useEffect(() => {
    setRiskData(initialState);
  }, [selectedRisks]);

  const handleSelect = async (
    {
      recs,
      adms,
      engs,
      epis,
      exams,
      generateSources,
      ...values
    }: Partial<IUpsertRiskData>,
    data?: any,
  ) => {
    if (selectedRisks?.length === 0) return;
    if (data?.isQuantity && values.probability) {
      enqueueSnackbar(
        'Você não pode mudar a probabilidade quando utilizado o método quantitativo.',
        {
          variant: 'warning',
          autoHideDuration: 300,
        },
      );
      return;
    }

    dispatch(setRiskAddState({ isEdited: true }));

    const submitData = { ...values } as IRiskDataRow;

    Object.entries({ recs, adms, engs, epis, generateSources, exams }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = removeDuplicate(
            [data, ...((riskData as any)?.[key] ?? [])],
            { removeById: 'id' },
          );
      },
    );

    setRiskData((old) => ({ ...old, ...submitData }));
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!selectedRiskStore?.id) return;

    const company = queryClient.getQueryData<ICompany>([
      QueryEnum.COMPANY,
      companyId,
    ]);

    if (!company) return;

    const workspaceEmployeesCount =
      company.workspace?.reduce((acc, workspace) => {
        const count = workspace?.employeeCount ? workspace?.employeeCount : 0;
        return acc + count;
      }, 0) || 0;

    const handleSelectSync = (value: number) => {
      handleSelect({ probability: value, ...data });
      enqueueSnackbar(`A probabilidade sugerida pelo sistema é ${value}`, {
        variant: 'info',
        autoHideDuration: 3000,
        style: { transform: 'translateY(70px)' },
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right',
        },
      });
    };

    onStackOpenModal(ModalEnum.PROBABILITY_ADD, {
      riskType: selectedRiskStore.type,
      employeeCountTotal: workspaceEmployeesCount,
      onCreate: handleSelectSync,
    } as typeof initialProbState);
  };

  const handleRemove = async ({
    recs,
    adms,
    engs,
    epis,
    exams,
    generateSources,
    ...values
  }: Partial<IUpsertRiskData>) => {
    if (!selectedRiskStore?.id) return;

    const submitData = { ...values } as IRiskDataRow;

    Object.entries({ recs, adms, generateSources }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...((riskData as any)?.[key]?.filter(
            (data: any) => !(value as any).includes(data.id),
          ) ?? []),
        ];
    });

    if (epis && epis?.length)
      submitData.epis = [...(riskData?.epis || [])].filter(
        (i) =>
          i && !epis.find((epi) => (epi?.epiId || (epi as any)?.id) == i.id),
      );

    if (engs && engs?.length)
      submitData.engs = [...(riskData?.engs || [])].filter(
        (i) =>
          i && !engs.find((eng) => (eng?.recMedId || (eng as any)?.id) == i.id),
      );

    if (exams && exams?.length)
      submitData.exams = [...(riskData?.exams || [])].filter(
        (i) =>
          i &&
          !exams.find((exam) => (exam?.examId || (exam as any)?.id) == i.id),
      );

    setRiskData((old) => ({ ...old, ...submitData }));
  };

  const handleSave = async () => {
    if (selectedRisks.length === 0) return;
    dispatch(setRiskAddState({ isSaving: true }));

    const selectedGhos = store.getState().ghoMulti.selectedIds as string[];
    const selectedDisabledGhos = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const { recs, adms, engs, epis, exams, generateSources } = riskData;

    const ghosIds = selectedGhos.filter(
      (selectedGho) => !selectedDisabledGhos.includes(selectedGho),
    );

    const submitData = {
      ...riskData,
      homogeneousGroupIds: ghosIds.map((gho) => gho.split('//')[0]),
      riskIds: selectedRisks.map((risk) => risk.id),
      riskFactorGroupDataId: riskGroupId,
      ...(isHierarchy
        ? {
            type: HomoTypeEnum.HIERARCHY,
            workspaceIds: ghosIds.map((gho) => gho.split('//')[1]),
          }
        : {}),
    };

    Object.entries({ recs, adms, generateSources }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...((riskData as any)?.[key]?.map((i: any) => i.id) ?? []),
        ];
    });

    Object.entries({ epis }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...((riskData as any)?.[key]?.map((i: IEpi) => ({
            ...i.epiRiskData,
            epiId: i.id,
          })) ?? []),
        ];
    });

    Object.entries({ engs }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...((riskData as any)?.[key]?.map((i: IRecMed) => ({
            ...i.engsRiskData,
            recMedId: i.id,
          })) ?? []),
        ];
    });

    Object.entries({ exams }).forEach(([key, value]) => {
      if (value?.length)
        (submitData as any)[key] = [
          ...((riskData as any)?.[key]?.map((i: IExam) => ({
            ...i.examsRiskData,
            examId: i.id,
          })) ?? []),
        ];
    });

    try {
      await upsertManyMut.mutateAsync(
        submitData as unknown as IUpsertManyRiskData,
      );
      setRiskData({ id: '' } as IRiskData);
      dispatch(setRiskAddState({ isSaving: false, isEdited: false }));
    } catch (error) {
      dispatch(setRiskAddState({ isSaving: false }));
    }
  };

  const handleDelete = async () => {
    return enqueueSnackbar('Função atualmente desativada', {
      variant: 'error',
      autoHideDuration: 3000,
    });

    if (selectedRisks.length === 0) return;
    dispatch(setRiskAddState({ isSaving: true }));

    const selectedGhos = store.getState().ghoMulti.selectedIds as string[];
    const selectedDisabledGhos = store.getState().ghoMulti
      .selectedDisabledIds as string[];

    const submitData = {
      homogeneousGroupIds: selectedGhos
        .filter((selectedGho) => !selectedDisabledGhos.includes(selectedGho))
        .map((gho) => gho.split('//')[0]),
      riskIds: selectedRisks.map((risk) => risk.id),
      riskFactorGroupDataId: riskGroupId as string,
      ...(isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
    };

    try {
      return;
      await deleteManyMut.mutateAsync(submitData);
      setRiskData({ id: '' } as IRiskData);
      dispatch(setRiskAddState({ isSaving: false, isEdited: false }));
    } catch (error) {
      dispatch(setRiskAddState({ isSaving: false }));
    }
  };

  const handleEditEpi = async (epi: IEpi) => {
    onHandleEditEpi(epi, (epis) => handleSelect({ epis }));
  };

  const handleEditEngs = async (eng: IRecMed) => {
    onHandleEditEngs(eng, (engs) => handleSelect({ engs }));
  };

  const handleEditExams = async (exam: IExam) => {
    onHandleEditExams(exam, (exams) => handleSelect({ exams }));
  };

  return (
    <>
      <RowColumns
        handleSelect={handleSelect}
        handleHelp={handleHelp}
        handleRemove={handleRemove}
        riskData={riskData}
        selectedRisks={selectedRisks}
        risk={selectedRiskStore}
        handleEditEpi={handleEditEpi}
        handleEditEngs={handleEditEngs}
        handleEditExams={handleEditExams}
        mt={10}
        isRepresentAll={
          selectedRiskStore?.representAll ||
          !!selectedRisks.find((r) => r?.representAll)
        }
      />

      <SButton
        id="delete-button-gho-select"
        loading={deleteManyMut.isLoading}
        style={{ height: '25px', maxWidth: '20px', display: 'none' }}
        onClick={handleDelete}
      >
        Deletar
      </SButton>
      <SButton
        id="save-button-gho-select"
        loading={upsertManyMut.isLoading}
        style={{ height: '25px', maxWidth: '20px', display: 'none' }}
        onClick={handleSave}
      >
        Adicionar
      </SButton>
    </>
  );
};
