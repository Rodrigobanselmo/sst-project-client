import React from 'react';

import { Box } from '@mui/material';

import { SRiskChipProps } from './SRiskChip.types';
import SChip from '@v2/components/atoms/SChip/SChip';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

const colorMap: Record<RiskTypeEnum, any> = {
  [RiskTypeEnum.ACI]: {
    color: 'risk.aci',
    bgcolor: 'risk.aciFade',
  },
  [RiskTypeEnum.BIO]: {
    color: 'risk.bio',
    bgcolor: 'risk.bioFade',
  },
  [RiskTypeEnum.ERG]: {
    color: 'risk.erg',
    bgcolor: 'risk.ergFade',
  },
  [RiskTypeEnum.FIS]: {
    color: 'risk.fis',
    bgcolor: 'risk.fisFade',
  },
  [RiskTypeEnum.QUI]: {
    color: 'risk.qui',
    bgcolor: 'risk.quiFade',
  },
  [RiskTypeEnum.OUTROS]: {
    color: 'risk.outros',
    bgcolor: 'risk.outrosFade',
  },
};

const sizeMap = {
  md: {
    fontSize: 9,
    padding: '1px 4px',
    width: '30px',
    minWidth: 'fit-content',
  },
};

export const SRiskChip = ({ type, size = 'md' }: SRiskChipProps) => {
  return (
    <SFlex
      borderRadius={1}
      center
      minWidth={sizeMap[size].minWidth}
      width={sizeMap[size].width}
      bgcolor={colorMap[type].bgcolor}
      p={sizeMap[size].padding}
      border={'1px solid'}
      borderColor={colorMap[type].color}
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
