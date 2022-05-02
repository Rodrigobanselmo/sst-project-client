import React, { FC } from 'react';

import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import {
  IDataAddRisk,
  selectGhoRiskData,
  selectRisk,
  setGhoRiskAddParams,
  setGhoRiskRemoveParams,
} from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
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

export const SideTable: FC<SideTableProps> = ({ gho, isSelected }) => {
  const risk = useAppSelector(selectRisk);
  const data = useAppSelector(selectGhoRiskData(gho.id, risk?.id ?? ''));
  const dispatch = useAppDispatch();

  const handleSelect = (values: IDataAddRisk) => {
    if (!risk?.id) return;

    dispatch(
      setGhoRiskAddParams({ data: values, ghoId: gho.id, riskId: risk.id }),
    );
  };

  const handleRemove = (values: IDataAddRisk) => {
    if (!risk?.id) return;

    dispatch(
      setGhoRiskRemoveParams({ data: values, ghoId: gho.id, riskId: risk.id }),
    );
  };

  const actualMatrixLevel = getMatrizRisk(data.probability, risk?.severity);
  const actualMatrixLevelAfter = getMatrizRisk(
    data.probabilityAfter,
    risk?.severity,
  );

  return (
    <STGridItem key={gho.id} selected={isSelected ? 1 : 0}>
      <SourceColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={data}
        risk={risk}
      />
      <EpiColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={data}
        risk={risk}
      />
      <EngColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={data}
        risk={risk}
      />
      <AdmColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={data}
        risk={risk}
      />
      <ProbabilityColumn handleSelect={handleSelect} data={data} />
      <STag
        action={String(actualMatrixLevel?.level) as unknown as ITagActionColors}
        text={actualMatrixLevel?.label || '--'}
        maxHeight={24}
      />
      <RecColumn
        handleSelect={handleSelect}
        handleRemove={handleRemove}
        data={data}
        risk={risk}
      />
      <ProbabilityAfterColumn handleSelect={handleSelect} data={data} />
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
