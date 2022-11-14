import React, { FC, useMemo } from 'react';

import SText from 'components/atoms/SText';

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
      text={employee?.name ? '' : '-'}
      {...props}
    >
      <div>
        <SText className="table-row-text" fontSize={12} lineNumber={1} mt={2}>
          {employee?.name}
        </SText>
        <SText className="table-row-text" fontSize={11} mt={0}>
          CPF: {cpfMask.mask(employee?.cpf)}
        </SText>
      </div>
    </TextIconRow>
  );
};
