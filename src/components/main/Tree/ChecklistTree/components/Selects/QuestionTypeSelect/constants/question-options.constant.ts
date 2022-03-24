/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';
import FlakyOutlinedIcon from '@mui/icons-material/FlakyOutlined';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import { QuestionOptionsEnum } from 'components/main/Tree/ChecklistTree/enums/question-options.enums';
export interface IQuestionOptions {
  value: QuestionOptionsEnum;
  name: string;
  label: string;
  selected?: QuestionOptionsEnum;
  icon: ElementType<any>;
}
interface IQuestionTypes
  extends Record<QuestionOptionsEnum, IQuestionOptions> {}

export const questionOptionsConstant = {
  [QuestionOptionsEnum.YEW_NO_NA]: {
    value: QuestionOptionsEnum.YEW_NO_NA,
    selected: QuestionOptionsEnum.ONE_ANSWER,
    name: 'Sim/Não/NA',
    label: 'padrão',
    icon: FlakyOutlinedIcon,
    desc: 'Tipo de resposta padrão, o qual o usuário terá que escolher entre sim, não e não se aplica',
  },
  [QuestionOptionsEnum.ONE_ANSWER]: {
    value: QuestionOptionsEnum.ONE_ANSWER,
    name: 'Resposta única',
    label: 'única',
    icon: LooksOneOutlinedIcon,
    desc: 'O usuário poderá selecionar somente uma das opções disponíveis',
  },
  [QuestionOptionsEnum.MULTIPLE]: {
    value: QuestionOptionsEnum.MULTIPLE,
    name: 'Resposta multipla',
    label: 'multipla',
    icon: DynamicFeedOutlinedIcon,
    desc: 'O usuário poderá selecionar multiplas opções',
  },
  [QuestionOptionsEnum.TEXT]: {
    value: QuestionOptionsEnum.TEXT,
    name: 'Resposta em texto',
    label: 'texto',
    icon: TextSnippetOutlinedIcon,
    desc: 'O usuário terá que digitar uma resposta',
  },
} as IQuestionTypes;
