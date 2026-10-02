import { Box, BoxProps } from '@mui/material';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable/EmployeesTable';

import { CompanyShiftsPanel } from './CompanyShiftsPanel';

export interface IEmployeeStage extends Partial<BoxProps> {}

export const EmployeeStage = ({ ...props }: IEmployeeStage) => {
  return (
    <Box {...props}>
      <CompanyShiftsPanel />
      <EmployeesTable hideModal />
    </Box>
  );
};
