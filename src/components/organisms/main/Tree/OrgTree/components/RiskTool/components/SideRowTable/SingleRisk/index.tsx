/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { useRouter } from 'next/router';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IExam } from 'core/interfaces/api/IExam';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { useColumnAction } from '../../../hooks/useColumnAction';
import { RowColumns } from '../components/RowColumns';
import { RiskToolSingleRiskRowProps } from './types';

export const RiskToolSingleRiskRow: FC<RiskToolSingleRiskRowProps> = ({
  risk,
  riskData,
  hide,
}) => {
  const gho = useAppSelector((state) => state.gho.selected);
  const { query } = useRouter();
  const {
    onHandleSelectSave,
    enqueueSnackbar,
    onHandleHelp,
    onHandleEditEpi,
    onHandleEditEngs,
    onHandleRemoveSave,
    onHandleEditExams,
  } = useColumnAction();

  const riskGroupId = riskData?.riskFactorGroupDataId;
  const handleSelect = async (values: Partial<IUpsertRiskData>) => {
    if (!risk?.id || !gho?.id) return;
    if (riskData?.isQuantity && values.probability) {
      enqueueSnackbar(
        'Você não pode mudar a probabilidade quando utilizado o método quantitativo.',
        {
          variant: 'warning',
          autoHideDuration: 3000,
        },
      );
      return;
    }

    const isHierarchy = 'childrenIds' in gho;

    const homoId = String(gho.id).split('//');
    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupId: homoId[0].split('//')[0],
      riskId: risk.id,
      riskFactorGroupDataId: riskData?.riskFactorGroupDataId as string,
      ...(isHierarchy
        ? {
            type: HomoTypeEnum.HIERARCHY,
            workspaceId: homoId[1],
          }
        : {}),
    } as IUpsertRiskData;

    await onHandleSelectSave({ ...submitData }, riskData, { keepEmpty: true });
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!risk?.id || !gho?.id) return;
    onHandleHelp({
      gho,
      risk,
      handleSelect: (value: number) =>
        handleSelect({ probability: value, ...data }),
    });
  };

  const handleRemove = async (values: Partial<IUpsertRiskData>) => {
    if (!risk?.id || !gho?.id) return;

    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupId: gho.id.split('//')[0],
      riskId: risk.id,
      riskFactorGroupDataId: riskGroupId as string,
      keepEmpty: true,
    } as IUpsertRiskData;

    await onHandleRemoveSave(submitData, riskData);
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
    <RowColumns
      hide={hide}
      handleSelect={handleSelect}
      handleHelp={handleHelp}
      handleRemove={handleRemove}
      riskData={riskData}
      handleEditExams={handleEditExams}
      risk={risk}
      handleEditEpi={handleEditEpi}
      handleEditEngs={handleEditEngs}
    />
  );
};
