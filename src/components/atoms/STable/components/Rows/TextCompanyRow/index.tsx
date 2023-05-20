import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import { getCompanyName } from 'core/utils/helpers/companyName';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import TextIconRow from '../TextIconRow';
import { TextCompanyRowProps } from './types';

export const TextCompanyRow: FC<{ children?: any } & TextCompanyRowProps> = ({
  company,
  showCNPJ,
  fontSize = 11,
  ...props
}) => {
  if (!company) return <div />;

  return (
    <TextIconRow
      tooltipTitle={
        <div onClick={(e) => e.stopPropagation()}>
          <SText color="common.white" fontSize={fontSize} mt={1}>
            {getCompanyName(company)}
          </SText>
          <SText color="common.white" fontSize={fontSize} mt={1}>
            CNPJ: {cnpjMask.mask(company?.cnpj)}
          </SText>
        </div>
      }
      text={company?.name ? '' : '-'}
      {...props}
    >
      <div>
        <SText
          className="table-row-text"
          fontSize={Number(fontSize) + 1}
          mt={2}
          lineNumber={showCNPJ ? 1 : 2}
        >
          {getCompanyName(company)}
        </SText>
        {showCNPJ && (
          <SText className="table-row-text" fontSize={fontSize} mt={0}>
            {cnpjMask.mask(company?.cnpj)}
          </SText>
        )}
      </div>
    </TextIconRow>
  );
};
