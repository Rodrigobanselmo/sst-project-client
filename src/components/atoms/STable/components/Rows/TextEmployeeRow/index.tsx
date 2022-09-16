import React, { FC, useMemo } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import { getCompanyName } from 'components/organisms/main/Header/Location';

import { cnpjMask } from 'core/utils/masks/cnpj.mask';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import TextIconRow from '../TextIconRow';
import { TextEmployeeRowProps } from './types';

export const TextEmployeeRow: FC<TextEmployeeRowProps> = ({
  employee,
  ...props
}) => {
  if (!employee) return <div />;

  return (
    <TextIconRow
      tooltipTitle={
        <div onClick={(e) => e.stopPropagation()}>
          <SText color="common.white" fontSize={13} mt={1}>
            {employee.name}
          </SText>
          <SText color="common.white" fontSize={13} mt={1}>
            CPF: {cpfMask.mask(employee.cpf)}
          </SText>
          {employee?.phone && (
            <SText color="common.white" fontSize={13}>
              Telefone: {employee?.phone || '-'}
            </SText>
          )}
          {employee?.email && (
            <SText color="common.white" fontSize={13}>
              Email:{employee?.email || '-'}
            </SText>
          )}
        </div>
      }
      text={
        employee?.name ? (
          <div>
            <SText fontSize={13} lineNumber={1} mt={1}>
              {employee.name}
            </SText>
            <SText fontSize={11} mt={1}>
              CPF: {cpfMask.mask(employee.cpf)}
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
