import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import TextIconRow from '../TextIconRow';
import { TextCompanyRowProps } from './types';

export const TextCompanyRow: FC<TextCompanyRowProps> = ({
  company,
  showCNPJ,
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
            CNPJ: {cnpjMask.mask(company?.cnpj)}
          </SText>
        </div>
      }
      text={
        company?.name ? (
          <div>
            <SText fontSize={13} mt={2} lineNumber={showCNPJ ? 1 : 2}>
              {getCompanyName(company)}
            </SText>
            {showCNPJ && (
              <SText fontSize={11} mt={0}>
                {cnpjMask.mask(company?.cnpj)}
              </SText>
            )}
          </div>
        ) : (
          '-'
        )
      }
      {...props}
    />
  );
};
