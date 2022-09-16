import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { getCompanyName } from 'components/organisms/main/Header/Location';

import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import TextIconRow from '../TextIconRow';
import { TextCompanyRowProps } from './types';

export const TextCompanyRow: FC<TextCompanyRowProps> = ({
  company,
  ...props
}) => {
  if (!company) return <div />;

  return (
    <TextIconRow
      tooltipTitle={
        <div onClick={(e) => e.stopPropagation()}>
          <SText color="common.white" fontSize={11} mt={1}>
            {getCompanyName(company)}
          </SText>
          <SText color="common.white" fontSize={11} mt={1}>
            CNPJ: {cnpjMask.mask(company.cnpj)}
          </SText>
        </div>
      }
      text={
        company?.name ? (
          <div>
            <SText fontSize={11} mt={1}>
              {getCompanyName(company)}
            </SText>
          </div>
        ) : (
          '-'
        )
      }
      {...props}
    />
  );
};
