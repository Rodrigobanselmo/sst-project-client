import React from 'react';

import { Box } from '@mui/material';

import { SRiskChipProps } from './SRiskChip.types';
import SChip from '@v2/components/atoms/SChip/SChip';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

const colorMap: Record<RiskTypeEnum, any> = {
  [RiskTypeEnum.ACI]: {
    backgroundColor: 'risk.aci',
    color: '#fff',
  },
  [RiskTypeEnum.BIO]: {
    backgroundColor: 'risk.bio',
    color: '#fff',
  },
  [RiskTypeEnum.ERG]: {
    backgroundColor: 'risk.erg',
    color: '#fff',
  },
  [RiskTypeEnum.FIS]: {
    backgroundColor: 'risk.fis',
    color: '#fff',
  },
  [RiskTypeEnum.QUI]: {
    backgroundColor: 'risk.qui',
    color: '#fff',
  },
  [RiskTypeEnum.OUTROS]: {
    backgroundColor: 'risk.outros',
    color: '#fff',
  },
};

const sizeMap = {
  md: {
    fontSize: 9,
    padding: '1px 4px',
    width: '30px',
  },
};

export const SRiskChip = ({ type, size = 'md' }: SRiskChipProps) => {
  return (
    <SFlex
      borderRadius={1}
      center
      minWidth={sizeMap[size].width}
      p={sizeMap[size].padding}
      bgcolor={colorMap[type].backgroundColor}
    >
      <SText
        fontWeight="500"
        color={colorMap[type].color}
        fontSize={sizeMap[size].fontSize}
      >
        {type}
      </SText>
    </SFlex>
  );
};
