export enum FilterFieldEnum {
  COMPANIES = 'companiesIds',
  COMPANIES_GROUP = 'companiesGroupIds',
  CITIES = 'cities',
  UF = 'uf',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  DOWLOAD_TYPE = 'downloadType',
}

type IMap = Record<
  FilterFieldEnum,
  {
    value: FilterFieldEnum;
    name: string;
  }
>;

export const filterFieldMap: IMap = {
  [FilterFieldEnum.COMPANIES]: {
    value: FilterFieldEnum.COMPANIES,
    name: 'Empresa',
  },
  [FilterFieldEnum.COMPANIES_GROUP]: {
    value: FilterFieldEnum.COMPANIES_GROUP,
    name: 'Grupo Empresarial',
  },
  [FilterFieldEnum.CITIES]: {
    value: FilterFieldEnum.CITIES,
    name: 'Cidades',
  },
  [FilterFieldEnum.UF]: {
    value: FilterFieldEnum.UF,
    name: 'Estado',
  },
  [FilterFieldEnum.START_DATE]: {
    value: FilterFieldEnum.START_DATE,
    name: 'Data Início',
  },
  [FilterFieldEnum.END_DATE]: {
    value: FilterFieldEnum.END_DATE,
    name: 'Data Fim',
  },
  [FilterFieldEnum.DOWLOAD_TYPE]: {
    value: FilterFieldEnum.DOWLOAD_TYPE,
    name: '',
  },
};

export const clinicFilterList = [
  FilterFieldEnum.CITIES,
  FilterFieldEnum.UF,
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
];

export const examsFilterList = [
  FilterFieldEnum.COMPANIES,
  FilterFieldEnum.COMPANIES_GROUP,
  FilterFieldEnum.START_DATE,
  FilterFieldEnum.END_DATE,
];
