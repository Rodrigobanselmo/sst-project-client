/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useState } from 'react';

import { SButton } from 'components/atoms/SButton';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { STagButton } from 'components/atoms/STagButton';
import { initialProbState } from 'components/organisms/modals/ModalAddProbability/hooks/useProbability';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { selectGhoMultiIds } from 'store/reducers/hierarchy/ghoMultiSlice';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  IUpsertManyRiskData,
  useMutUpsertManyRiskData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertManyRiskData';
import {
  IUpsertRiskData,
  useMutUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';
import { queryClient } from 'core/services/queryClient';
import { getMatrizRisk } from 'core/utils/helpers/matriz';

import { AdmColumn } from '../components/columns/AdmColumn';
import { EngColumn } from '../components/columns/EngColumn';
import { EpiColumn } from '../components/columns/EpiColumn';
import { ProbabilityAfterColumn } from '../components/columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from '../components/columns/ProbabilityColumn';
import { RecColumn } from '../components/columns/RecColumn';
import { SourceColumn } from '../components/columns/SourceColumn';
import { STGridItem } from '../styles';
import { SideTableMultipleProps } from './types';

export const SideRowTableMulti: FC<SideTableMultipleProps> = () => {
  const risk = useAppSelector(selectRisk);
  const upsertRiskData = useMutUpsertRiskData();
  const ghos = useAppSelector(selectGhoMultiIds);
  const { companyId } = useGetCompanyId();
  const { onOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { query } = useRouter();
  const upsertManyMut = useMutUpsertManyRiskData();
  const [riskData, setRiskData] = useState<IRiskData>({ id: '' } as IRiskData);

  const isSelected = false;

  useEffect(() => {
    setRiskData({ id: '' } as IRiskData);
  }, [risk]);

  const handleSelect = async (
    {
      recs,
      adms,
      engs,
      epis,
      generateSources,
      ...values
    }: Partial<IUpsertRiskData>,
    data?: any,
  ) => {
    if (!risk?.id) return;

    const submitData = {
      ...values,
      id: riskData?.id,
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId as string,
    } as IRiskData;

    Object.entries({ recs, adms, engs, epis, generateSources }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = [
            data,
            ...((riskData as any)?.[key] ?? []),
          ];
      },
    );

    setRiskData((old) => ({ ...old, ...submitData }));
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

    const company = queryClient.getQueryData<ICompany>([
      QueryEnum.COMPANY,
      companyId,
    ]);

    if (!company) return;

    const ghoCount = 0;
    const workspaceEmployeesCount =
      company.workspace?.reduce((acc, workspace) => {
        const count = workspace?.employeeCount ? workspace?.employeeCount : 0;
        return acc + count;
        // ghos.map((gho) => {
        //   if (gho.workspaceIds.includes(workspace.id))
        //     acc + (workspace?.employeeCount ?? 0);
        // });
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

    onOpenModal(ModalEnum.PROBABILITY_ADD, {
      riskType: risk.type,
      intensityLt: risk.nr15lt,
      employeeCountGho: ghoCount,
      employeeCountTotal: workspaceEmployeesCount,
      onCreate: handleSelectSync,
    } as typeof initialProbState);
  };

  const handleRemove = async ({
    recs,
    adms,
    engs,
    epis,
    generateSources,
    ...values
  }: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;
    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupIds: ghos,
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId as string,
    } as IUpsertRiskData;

    Object.entries({ recs, adms, engs, epis, generateSources }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = [
            ...(
              (riskData as any)?.[key]?.filter(
                (data: any) => !(value as any).includes(data.id),
              ) ?? []
            ).map((d: any) => d.id),
          ];
      },
    );

    await upsertRiskData.mutateAsync({
      ...submitData,
    });
  };

  const handleSave = async () => {
    if (!risk?.id) return;

    const { recs, adms, engs, epis, generateSources } = riskData;

    const submitData = {
      ...riskData,
      homogeneousGroupIds: ghos,
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId,
    };

    Object.entries({ recs, adms, engs, epis, generateSources }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = [
            ...((riskData as any)?.[key]?.map((i: any) => i.id) ?? []),
          ];
      },
    );

    await upsertManyMut.mutateAsync(
      submitData as unknown as IUpsertManyRiskData,
    );

    setRiskData({ id: '' } as IRiskData);
  };

  const actualMatrixLevel = getMatrizRisk(
    riskData?.probability,
    risk?.severity,
  );
  const actualMatrixLevelAfter = getMatrizRisk(
    riskData?.probabilityAfter,
    risk?.severity,
  );

  return (
    <STGridItem
      sx={{
        gridTemplateColumns:
          'minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) 120px 120px minmax(100px, 1fr) 120px 120px 120px', //! fix this
      }}
      mt={10}
      selected={isSelected ? 1 : 0}
      onClick={() =>
        risk?.id ? null : document.getElementById('risk-select-id')?.click()
      }
    >
      <SourceColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={riskData}
        risk={risk}
      />
      <EpiColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={riskData}
        risk={risk}
      />
      <EngColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={riskData}
        risk={risk}
      />
      <AdmColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={riskData}
        risk={risk}
      />
      <ProbabilityColumn
        handleHelp={handleHelp}
        handleSelect={handleSelect}
        data={riskData}
      />
      <STag
        action={String(actualMatrixLevel?.level) as unknown as ITagActionColors}
        text={actualMatrixLevel?.label || '--'}
        maxHeight={24}
      />
      <RecColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={riskData}
        risk={risk}
      />
      <ProbabilityAfterColumn handleSelect={handleSelect} data={riskData} />
      <STag
        action={
          String(actualMatrixLevelAfter?.level) as unknown as ITagActionColors
        }
        maxHeight={24}
        text={actualMatrixLevelAfter?.label || '--'}
      />
      <SButton
        loading={upsertManyMut.isLoading}
        style={{ height: '25px', maxWidth: '20px' }}
        onClick={handleSave}
      >
        Salvar
      </SButton>
    </STGridItem>
  );
};
