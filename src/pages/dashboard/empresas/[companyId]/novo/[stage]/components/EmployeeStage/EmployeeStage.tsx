import { Box, BoxProps } from '@mui/material';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable/EmployeesTable';

export interface IEmployeeStage extends Partial<BoxProps> {}

export const EmployeeStage = ({ ...props }: IEmployeeStage) => {
  return (
    <Box {...props}>
      <EmployeesTable hideModal />
    </Box>
  );
};
