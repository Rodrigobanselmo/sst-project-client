/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import { QuestionOptionsEnum } from 'core/enums/question-options.enums';

export interface IQuestionOptions {
  value: QuestionOptionsEnum;
  name: string;
  label: string;
  icon: ElementType<any>;
}
interface IQuestionTypes
  extends Record<QuestionOptionsEnum, IQuestionOptions> {}

export const questionOptionsConstant = {
  [QuestionOptionsEnum.ONE_ANSWER]: {
    value: QuestionOptionsEnum.ONE_ANSWER,
    name: 'Resposta única',
    label: 'única',
    icon: LooksOneOutlinedIcon,
  },
  [QuestionOptionsEnum.MULTIPLE]: {
    value: QuestionOptionsEnum.MULTIPLE,
    name: 'Resposta multipla',
    label: 'multipla',
    icon: DynamicFeedOutlinedIcon,
  },
  [QuestionOptionsEnum.TEXT]: {
    value: QuestionOptionsEnum.TEXT,
    name: 'Resposta em texto',
    label: 'texto',
    icon: TextSnippetOutlinedIcon,
  },
} as IQuestionTypes;
