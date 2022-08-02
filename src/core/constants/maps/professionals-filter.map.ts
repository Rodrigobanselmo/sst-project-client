import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

export enum ProfessionalFilterTypeEnum {
  ALL = 'todos',
  MEDICINE = 'medicina',
  SECURITY = 'seguranca',
  OTHERS = 'outros',
}

export interface IProfessionalsFilterOption {
  value: ProfessionalFilterTypeEnum;
  label: string;
  filters?: ProfessionalTypeEnum[];
}
interface IProfessionalsFilterOptions
  extends Record<ProfessionalFilterTypeEnum, IProfessionalsFilterOption> {}

export const professionalFiltersMap = {
  [ProfessionalFilterTypeEnum.ALL]: {
    value: ProfessionalFilterTypeEnum.ALL,
    label: 'Todos',
  },
  [ProfessionalFilterTypeEnum.MEDICINE]: {
    value: ProfessionalFilterTypeEnum.MEDICINE,
    label: 'Médicina',
    filters: [
      ProfessionalTypeEnum.DOCTOR,
      ProfessionalTypeEnum.NURSE,
      ProfessionalTypeEnum.SPEECH_THERAPIST,
    ],
  },
  [ProfessionalFilterTypeEnum.SECURITY]: {
    value: ProfessionalFilterTypeEnum.SECURITY,
    label: 'Segurança',
    filters: [ProfessionalTypeEnum.TECHNICIAN, ProfessionalTypeEnum.ENGINEER],
  },
  [ProfessionalFilterTypeEnum.OTHERS]: {
    value: ProfessionalFilterTypeEnum.OTHERS,
    label: 'Outros',
    filters: [ProfessionalTypeEnum.USER, ProfessionalTypeEnum.OTHER],
  },
} as IProfessionalsFilterOptions;

export const professionalsFilterOptionsList = [
  professionalFiltersMap[ProfessionalFilterTypeEnum.ALL],
  professionalFiltersMap[ProfessionalFilterTypeEnum.SECURITY],
  professionalFiltersMap[ProfessionalFilterTypeEnum.MEDICINE],
  professionalFiltersMap[ProfessionalFilterTypeEnum.OTHERS],
];
