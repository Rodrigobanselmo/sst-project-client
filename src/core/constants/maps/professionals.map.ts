import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

export interface IProfessionalsOption {
  value: ProfessionalTypeEnum;
  name: string;
}
interface IProfessionalsOptions
  extends Record<ProfessionalTypeEnum, IProfessionalsOption> {}

export const professionalMap = {
  [ProfessionalTypeEnum.DOCTOR]: {
    value: ProfessionalTypeEnum.DOCTOR,
    name: 'Médico',
  },
  [ProfessionalTypeEnum.NURSE]: {
    value: ProfessionalTypeEnum.NURSE,
    name: 'Enfermeiro',
  },
  [ProfessionalTypeEnum.DENTIST]: {
    value: ProfessionalTypeEnum.DENTIST,
    name: 'Dentista',
  },
  [ProfessionalTypeEnum.SPEECH_THERAPIST]: {
    value: ProfessionalTypeEnum.SPEECH_THERAPIST,
    name: 'Fonoaudiólogo',
  },
  [ProfessionalTypeEnum.ENGINEER]: {
    value: ProfessionalTypeEnum.ENGINEER,
    name: 'Engenheiro',
  },
  [ProfessionalTypeEnum.TECHNICIAN]: {
    value: ProfessionalTypeEnum.TECHNICIAN,
    name: 'Técnico',
  },
  [ProfessionalTypeEnum.USER]: {
    value: ProfessionalTypeEnum.USER,
    name: 'Usuário',
  },
  [ProfessionalTypeEnum.OTHER]: {
    value: ProfessionalTypeEnum.OTHER,
    name: 'Outro',
  },
} as IProfessionalsOptions;

export const professionalsDocOptionsList = [
  professionalMap[ProfessionalTypeEnum.DOCTOR],
  professionalMap[ProfessionalTypeEnum.DENTIST],
];

export const professionalsHealthOptionsList = [
  professionalMap[ProfessionalTypeEnum.DOCTOR],
  professionalMap[ProfessionalTypeEnum.NURSE],
  // professionalMap[ProfessionalTypeEnum.SPEECH_THERAPIST],
];

export const professionalsSSTOptionsList = [
  professionalMap[ProfessionalTypeEnum.ENGINEER],
  professionalMap[ProfessionalTypeEnum.TECHNICIAN],
];

export const professionalsOptionsList = [
  ...professionalsHealthOptionsList,
  ...professionalsSSTOptionsList,
  // professionalMap[ProfessionalTypeEnum.USER],
  professionalMap[ProfessionalTypeEnum.OTHER],
];
