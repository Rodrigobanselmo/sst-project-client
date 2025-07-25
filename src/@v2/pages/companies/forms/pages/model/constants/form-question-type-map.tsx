import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import EventIcon from '@mui/icons-material/Event';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import ShortTextOutlinedIcon from '@mui/icons-material/ShortTextOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionTypeEnumTranslate } from '@v2/models/form/translations/form-question-type.translation';
import { ReactNode } from 'react';
type FormQuestionTypeMapValue = {
  value: FormQuestionTypeEnum;
  label: string;
  icon: ReactNode;
};

const defaultSx = { fontSize: 20 };

export const FormQuestionTypeMap: Record<
  FormQuestionTypeEnum,
  FormQuestionTypeMapValue
> = {
  [FormQuestionTypeEnum.SHORT_TEXT]: {
    value: FormQuestionTypeEnum.SHORT_TEXT,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.SHORT_TEXT],
    icon: <ShortTextOutlinedIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.LONG_TEXT]: {
    value: FormQuestionTypeEnum.LONG_TEXT,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.LONG_TEXT],
    icon: <NotesOutlinedIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.TEXT]: {
    value: FormQuestionTypeEnum.TEXT,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.TEXT],
    icon: <NotesIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.RADIO]: {
    value: FormQuestionTypeEnum.RADIO,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.RADIO],
    icon: <CheckCircleOutlineOutlinedIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.CHECKBOX]: {
    value: FormQuestionTypeEnum.CHECKBOX,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.CHECKBOX],
    icon: <CheckBoxOutlinedIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.SELECT]: {
    value: FormQuestionTypeEnum.SELECT,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.SELECT],
    icon: <ListOutlinedIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.DATE]: {
    value: FormQuestionTypeEnum.DATE,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.DATE],
    icon: <EventIcon sx={defaultSx} />,
  },
  [FormQuestionTypeEnum.NUMBER]: {
    value: FormQuestionTypeEnum.NUMBER,
    label: FormQuestionTypeEnumTranslate[FormQuestionTypeEnum.NUMBER],
    icon: <ViewWeekOutlinedIcon sx={defaultSx} />,
  },
};

export const FormQuestionTypeMapList = [
  FormQuestionTypeMap[FormQuestionTypeEnum.RADIO],
  FormQuestionTypeMap[FormQuestionTypeEnum.CHECKBOX],
  FormQuestionTypeMap[FormQuestionTypeEnum.SELECT],
  FormQuestionTypeMap[FormQuestionTypeEnum.SHORT_TEXT],
  FormQuestionTypeMap[FormQuestionTypeEnum.LONG_TEXT],
  FormQuestionTypeMap[FormQuestionTypeEnum.DATE],
  FormQuestionTypeMap[FormQuestionTypeEnum.NUMBER],
];
