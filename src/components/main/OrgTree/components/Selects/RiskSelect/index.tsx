import React, { FC } from 'react';

import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Box, CircularProgress } from '@mui/material';

import { useQueryRisk } from '../../../../../../core/services/hooks/queries/useQueryRisk';
import { STagSearchSelect } from '../../../../../molecules/STagSearchSelect';
import { ITypeSelectProps } from './types';

export const RiskSelect: FC<ITypeSelectProps> = ({
  large,
  handleSelect,
  node,
  ...props
}) => {
  const { data } = useQueryRisk();

  if (!data) return <CircularProgress />;

  const handleSelectRisk = (option: string[]) => {
    handleSelect && handleSelect(option);
  };

  const riskLength = String(node.risks ? node.risks.length : 0);

  return (
    <STagSearchSelect
      options={data}
      icon={ReportProblemOutlinedIcon}
      multiple
      text={riskLength}
      large={large}
      handleSelectMenu={handleSelectRisk}
      selected={node?.risks ?? []}
      startAdornment={(options: typeof data[0]) => (
        <Box
          sx={{
            backgroundColor: `risk.${options.type}`,
            color: 'common.white',
            px: 4,
            py: '1px',
            borderRadius: 3,
            mr: 6,
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
