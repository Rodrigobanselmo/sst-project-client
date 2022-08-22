export enum EmployeeHierarchyMotiveTypeEnum {
  ADM = 'ADM',
  TRANS = 'TRANS',
  ALOC = 'ALOC',
  PROM = 'PROM',
  TRANS_PROM = 'TRANS_PROM',
  DEM = 'DEM',
}

export const employeeHierarchyMotiveTypeMap: Record<
  EmployeeHierarchyMotiveTypeEnum,
  {
    value: EmployeeHierarchyMotiveTypeEnum;
    content: string;
    status?: 'inactive' | 'warn' | 'info' | 'success';
  }
> = {
  [EmployeeHierarchyMotiveTypeEnum.ADM]: {
    value: EmployeeHierarchyMotiveTypeEnum.ADM,
    content: 'Admissão',
    status: 'info',
  },
  [EmployeeHierarchyMotiveTypeEnum.TRANS]: {
    value: EmployeeHierarchyMotiveTypeEnum.TRANS,
    content: 'Transferência',
  },
  [EmployeeHierarchyMotiveTypeEnum.ALOC]: {
    value: EmployeeHierarchyMotiveTypeEnum.ALOC,
    content: 'Alocação',
  },
  [EmployeeHierarchyMotiveTypeEnum.PROM]: {
    value: EmployeeHierarchyMotiveTypeEnum.PROM,
    content: 'Promoção',
  },
  [EmployeeHierarchyMotiveTypeEnum.TRANS_PROM]: {
    value: EmployeeHierarchyMotiveTypeEnum.TRANS_PROM,
    content: 'Transferência/Promoção',
  },
  [EmployeeHierarchyMotiveTypeEnum.DEM]: {
    value: EmployeeHierarchyMotiveTypeEnum.DEM,
    content: 'Demissão',
    status: 'inactive',
  },
};

export const employeeHierarchyMotiveTypeList = [
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.ADM],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.TRANS],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.ALOC],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.PROM],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.TRANS_PROM],
  employeeHierarchyMotiveTypeMap[EmployeeHierarchyMotiveTypeEnum.DEM],
];
