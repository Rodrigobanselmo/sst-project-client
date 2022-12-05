/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';

import { IdsEnum } from 'core/enums/ids.enums';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { IUseMotiveData } from '../../hooks/useEmployeeData';

export const EmployeeContent = ({
  setCatData,
  catData,
  employee,
  company,
  onSelectEmployee,
  isEdit,
}: IUseMotiveData) => {
  return (
    <Box>
      {!isEdit && (
        <EmployeeSelect
          multiple={false}
          editOnSelection
          large
          queryEmployee={{ all: company.isConsulting }}
          id={IdsEnum.EMPLOYEE_SELECT_ID}
          text={'Selecionar Funcionário'}
          handleSelect={(e: IEmployee) => {
            if (e)
              setCatData({
                ...catData,
                employeeId: e.id,
                companyId: e.companyId,
              });
          }}
        />
      )}
      <SFlex flexWrap="wrap" mb={5} gap={5} mt={10}>
        <Box flex={1}>
          <SInput
            value={employee?.name || ''}
            sx={{ minWidth: 200 }}
            onClick={onSelectEmployee}
            InputLabelProps={{ shrink: !!employee?.name }}
            fullWidth
            label="Nome Funcionário"
            size="small"
            disabled
            labelPosition="center"
          />
        </Box>
        <Box flex={1}>
          <SInput
            value={cpfMask.mask(employee?.cpf) || ''}
            sx={{ minWidth: 200 }}
            onClick={onSelectEmployee}
            fullWidth
            label="CPF"
            size="small"
            disabled
            labelPosition="center"
          />
        </Box>
        <SFlex align={'center'} flex={1}>
          {employee?.status && (
            <StatusSelect
              large
              sx={{ minWidth: '100px', minHeight: '40px' }}
              selected={employee.status}
              disabled
              statusOptions={[]}
            />
          )}
        </SFlex>
      </SFlex>
      <SFlex flexWrap="wrap" mb={5} gap={5} mt={10}>
        <Box flex={1}>
          <SInput
            value={employee ? getCompanyName(company) || '' : ''}
            sx={{ minWidth: 200, maxWidth: 800 }}
            fullWidth
            onClick={onSelectEmployee}
            label="Empresa"
            size="small"
            disabled
            labelPosition="center"
          />
        </Box>
      </SFlex>
    </Box>
  );
};
