import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { GenerateSourceSelect } from 'components/tagSelects/GenerateSourceSelect';
import {
  IDataAddRisk,
  selectGhoRiskData,
  selectRisk,
  setGhoRiskAddParams,
  setGhoRiskRemoveParams,
} from 'store/reducers/hierarchy/riskAddSlice';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';

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
          <STooltip title={gs.name} key={gs.id}>
            <SFlex mt={4} align="center">
              <SIconButton
                color="error"
                onClick={() =>
                  handleRemove({
                    gs: [{ id: gs.id, name: '' }],
                  })
                }
              >
                <Icon component={SDeleteIcon} sx={{ fontSize: 14 }} />
              </SIconButton>
              <SText lineNumber={2} variant="body2">
                {gs.name}
              </SText>
            </SFlex>
          </STooltip>
        ))}
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
