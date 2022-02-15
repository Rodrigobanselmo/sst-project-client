import React, { FC } from 'react';

import CircleIcon from '@mui/icons-material/Circle';
import SFlex from 'components/atoms/SFlex';
import STooltip from 'components/atoms/STooltip';

import { brandNameConstant } from 'core/constants/brand.constant';

import { SystemRowProps } from './types';

const SystemRow: FC<SystemRowProps> = ({ system, ...props }) => (
  <STooltip
    title={
      system
        ? `Criado pela equipe de profissionais da ${brandNameConstant}`
        : 'Criado por membros de sua equipe'
    }
  >
    <SFlex center {...props}>
      <CircleIcon
        sx={{
          color: system ? 'success.main' : 'error.main',
          fontSize: '12px',
          mr: 1,
        }}
      />
    </SFlex>
  </STooltip>
);

export default SystemRow;
