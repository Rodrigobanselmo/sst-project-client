/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { initialProbState } from 'components/organisms/modals/ModalAddProbability/hooks/useProbability';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IEpi } from 'core/interfaces/api/IEpi';
import {
  IUpsertRiskData,
  useMutUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { queryClient } from 'core/services/queryClient';
import { getMatrizRisk } from 'core/utils/helpers/matriz';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { AdmColumn } from '../components/columns/AdmColumn';
import { EngColumn } from '../components/columns/EngColumn';
import { EpiColumn } from '../components/columns/EpiColumn';
import { ProbabilityAfterColumn } from '../components/columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from '../components/columns/ProbabilityColumn';
import { RecColumn } from '../components/columns/RecColumn';
import { SourceColumn } from '../components/columns/SourceColumn';
import { STGridItem } from '../styles';
import { SideTableProps } from './types';

export const SideRowTable: FC<SideTableProps> = ({
  gho,
  riskData,
  isSelected,
  hide,
}) => {
  const risk = useAppSelector(selectRisk);
  const upsertRiskData = useMutUpsertRiskData();
  const { companyId } = useGetCompanyId();
  const { onOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const { query } = useRouter();
  const { getPathById } = useHierarchyTreeActions();

  const isHierarchy = 'childrenIds' in gho;

  const handleSelect = async ({
    recs,
    adms,
    engs,
    epis,
    generateSources,
    ...values
  }: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

    if (riskData?.isQuantity && values.probability)
      return enqueueSnackbar(
        'Você não pode mudar a probabilidade quando utilizado o método quantitativo.',
        {
          variant: 'warning',
          autoHideDuration: 3000,
        },
      );

    const homoId = String(gho.id).split('//');
    const submitData = {
      ...values,
      id: riskData?.id,
      homogeneousGroupId: homoId[0].split('//')[0],
      workspaceId: homoId.length == 2 ? homoId[1] : undefined,
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId as string,
      ...(isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
    } as IUpsertRiskData;

    Object.entries({ recs, adms, engs, generateSources }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = [
            ...value,
            ...((riskData as any)?.[key]?.map((rec: any) => rec.id) ?? []),
          ];
      },
    );

    if (epis && epis?.length)
      submitData.epis = removeDuplicate(
        [
          ...epis,
          ...(riskData?.epis?.map((epi) => epi.epiRiskData) || []),
        ].filter((i) => i),
        { removeById: 'epiId' },
      );

    await upsertRiskData
      .mutateAsync({
        ...submitData,
      })
      .catch(() => {});
  };

  const handleHelp = async (data: Partial<IUpsertRiskData>) => {
    if (!risk?.id) return;

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
      employeeCountGho: isHierarchy ? 0 : gho.employeeCount,
      hierarchyId: isHierarchy ? gho.id : '',
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
      homogeneousGroupId: gho.id.split('//')[0],
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId as string,
    } as IUpsertRiskData;

    Object.entries({ recs, adms, engs, generateSources }).forEach(
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

    if (epis && epis?.length)
      submitData.epis = [
        ...(riskData?.epis?.map((epi) => epi.epiRiskData) || []),
      ].filter((i) => i && !epis.find((epi) => epi.epiId == i.epiId));

    await upsertRiskData
      .mutateAsync({
        ...submitData,
      })
      .catch(() => {});
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
      onClick={() =>
        risk?.id ? null : document.getElementById(IdsEnum.RISK_SELECT)?.click()
      }
      key={gho.id}
      selected={isSelected ? 1 : 0}
    >
      {!hide && (
        <>
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
            risk={risk}
          />
          <STag
            action={
              String(actualMatrixLevel?.level) as unknown as ITagActionColors
            }
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
              String(
                actualMatrixLevelAfter?.level,
              ) as unknown as ITagActionColors
            }
            maxHeight={24}
            text={actualMatrixLevelAfter?.label || '--'}
          />
        </>
      )}
    </STGridItem>
  );
};
