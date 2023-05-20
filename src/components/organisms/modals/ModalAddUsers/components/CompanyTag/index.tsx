/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import SDeleteIcon from 'assets/icons/SDeleteIcon';

import { ICompany } from 'core/interfaces/api/ICompany';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

export const CompanyTag: FC<
  { children?: any } & {
    company: ICompany;
    handleRemoveCompany: (company: ICompany) => void;
  }
> = ({ company, handleRemoveCompany }) => {
  return (
    <SFlex
      border={'1px solid'}
      borderColor="grey.300"
      minWidth={150}
      maxWidth={200}
      flex={1}
      px={4}
      borderRadius={1}
      py={1}
      center
      sx={{ backgroundColor: 'grey.100' }}
    >
      <STooltip
        title={
          <p>
            {company.name}
            <br /> {company.fantasy}
          </p>
        }
      >
        <Box>
          <SText maxWidth="100px" noBreak fontSize={12}>
            {company.name}
          </SText>
          <SText fontSize={11}>{cnpjMask.mask(company.cnpj)}</SText>
        </Box>
      </STooltip>
      <STooltip withWrapper title={'Remover'}>
        <SIconButton onClick={() => handleRemoveCompany(company)} size="small">
          <Icon component={SDeleteIcon} sx={{ fontSize: '1rem' }} />
        </SIconButton>
      </STooltip>
    </SFlex>
  );
};
