/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { useRouter } from 'next/router';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import {
  IUpsertRiskData,
  useMutUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';
import { getMatrizRisk } from 'core/utils/helpers/matriz';

import { AdmColumn } from './components/columns/AdmColumn';
import { EngColumn } from './components/columns/EngColumn';
import { EpiColumn } from './components/columns/EpiColumn';
import { ProbabilityAfterColumn } from './components/columns/ProbabilityAfterColumn';
import { ProbabilityColumn } from './components/columns/ProbabilityColumn';
import { RecColumn } from './components/columns/RecColumn';
import { SourceColumn } from './components/columns/SourceColumn';
import { STGridItem } from './styles';
import { SideTableProps } from './types';

export const SideTable: FC<SideTableProps> = ({
  gho,
  riskData,
  isSelected,
}) => {
  const risk = useAppSelector(selectRisk);
  const upsertRiskData = useMutUpsertRiskData();
  const { query } = useRouter();

  const handleSelect = async ({
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
      homogeneousGroupId: gho.id,
      riskId: risk.id,
      riskFactorGroupDataId: query.riskGroupId as string,
    } as IUpsertRiskData;

    Object.entries({ recs, adms, engs, epis, generateSources }).forEach(
      ([key, value]) => {
        if (value?.length)
          (submitData as any)[key] = [
            ...value,
            ...((riskData as any)?.[key]?.map((rec: any) => rec.id) ?? []),
          ];
      },
    );

    await upsertRiskData.mutateAsync({
      ...submitData,
    });
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
      homogeneousGroupId: gho.id,
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
        risk?.id ? null : document.getElementById('risk-select-id')?.click()
      }
      key={gho.id}
      selected={isSelected ? 1 : 0}
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
      <ProbabilityColumn handleSelect={handleSelect} data={riskData} />
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
    </STGridItem>
  );
};
