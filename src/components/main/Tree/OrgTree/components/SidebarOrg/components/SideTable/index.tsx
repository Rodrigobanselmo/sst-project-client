import React, { FC } from 'react';

import { Box } from '@mui/material';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import SText from 'components/atoms/SText';
import { GenerateSourceSelect } from 'components/tagSelects/GenerateSourceSelect';
import {
  IDataAddRisk,
  selectGhoRiskData,
  selectRisk,
  setGhoRiskAddParams,
  setGhoRiskRemoveParams,
} from 'store/reducers/hierarchy/riskAddSlice';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';
import { getMatrizRisk } from 'core/utils/helpers/matrizConvertion';

import { SelectedNumber } from './components/SelectedNumber';
import { SelectedTableItem } from './components/SelectedTableItem';
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

  return (
    <STGridItem key={gho.id} selected={isSelected ? 1 : 0}>
      <Box>
        <GenerateSourceSelect
          disabled={!risk?.id}
          text={'adicionar'}
          tooltipTitle=""
          multiple={false}
          riskIds={[risk?.id || '']}
          risk={risk ? risk : undefined}
          handleSelect={(options) => {
            const op = options as IGenerateSource;
            if (op.id)
              handleSelect({
                gs: [{ id: op.id, name: op.name }],
              });
          }}
        />
        {data.gs?.map((gs) => (
          <SelectedTableItem
            key={gs.id}
            name={gs.name}
            handleRemove={() =>
              handleRemove({
                gs: [{ id: gs.id, name: '' }],
              })
            }
          />
        ))}
      </Box>
      <SelectedNumber
        handleSelect={(number) => handleSelect({ probability: number })}
        selectedNumber={data.probability}
      />
      <STag
        action={String(actualMatrixLevel?.level) as unknown as ITagActionColors}
        text={actualMatrixLevel?.label || 'indisponivel'}
      />
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
    </STGridItem>
  );
};
