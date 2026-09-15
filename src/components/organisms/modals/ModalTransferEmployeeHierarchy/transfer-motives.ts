import {
  EmployeeHierarchyMotiveTypeEnum,
  employeeHierarchyMotiveTypeMap,
} from 'project/enum/employee-hierarchy-motive.enum';

export const employeeHierarchyTransferMotiveList = [
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.TRANS],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.PROM],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.ALOC],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.TRANS_PROM],
];
