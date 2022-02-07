import React, { FC } from 'react';

import MergeTypeIcon from '@mui/icons-material/MergeType';
import { Box, CircularProgress } from '@mui/material';

import { IRiskFactors } from '../../../../../../core/interfaces/IRiskFactors';
import { useQueryRisk } from '../../../../../../core/services/hooks/queries/useQueryRisk';
import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { STagSelect } from '../../../../../molecules/STagSelect';
import { ITypeSelectProps } from './types';

export const RiskSelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();

  if (!data) return <CircularProgress />;

  const handleSelectRisk = (option: IRiskFactors) => {
    handleSelect && handleSelect(option);
  };

  const riskLength = String(node.risks ? node.risks.length : 0);

  return (
    <STagSearchSelect
      options={data}
      text={riskLength}
      large={large}
      handleSelectMenu={handleSelectRisk}
      startAdornment={(options: typeof data[0]) => (
        <Box
          sx={{
            backgroundColor: `risk.${options.type}`,
            color: 'common.white',
            px: 4,
            py: '1px',
            borderRadius: 3,
            mr: 5,
          }}
        >
          {options.type}
        </Box>
      )}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};
