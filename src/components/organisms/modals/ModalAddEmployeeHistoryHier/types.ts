import { BoxProps } from '@mui/material';
import { EmployeeHierarchyMotiveTypeEnum } from 'project/enum/employee-hierarchy-motive.enum';

export interface SModalContactProps extends Omit<BoxProps, 'title'> {}
export interface SModalInitContactProps {
  motive: EmployeeHierarchyMotiveTypeEnum;
}
