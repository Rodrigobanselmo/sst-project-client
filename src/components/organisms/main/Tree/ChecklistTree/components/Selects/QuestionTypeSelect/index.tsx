/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { IMenuOptionResponse } from 'components/molecules/SMenu/types';
import { STagSelect } from 'components/molecules/STagSelect';
import { QuestionOptionsEnum } from 'components/organisms/main/Tree/ChecklistTree/enums/question-options.enums';
import { usePreventNode } from 'components/organisms/main/Tree/ChecklistTree/hooks/usePreventNode';

import {
  IQuestionOptions,
  questionOptionsConstant,
} from './constants/question-options.constant';
import { IQuestionTypeSelectSelectProps } from './types';

export const QuestionTypeSelect: FC<
  { children?: any } & IQuestionTypeSelectSelectProps
> = ({ large, handleSelect, node, keepOnlyPersonalized, ...props }) => {
  const { preventMultipleTextOptions } = usePreventNode();

  const handleSelectOption = ({ name, value }: IMenuOptionResponse) => {
    const VALUE = value as QuestionOptionsEnum;

    if (preventMultipleTextOptions(node, VALUE)) return;

    handleSelect && handleSelect({ value: VALUE as QuestionOptionsEnum, name });
  };

  const options = useMemo(() => {
    const personalized = [
      QuestionOptionsEnum.ONE_ANSWER,
      QuestionOptionsEnum.MULTIPLE,
      QuestionOptionsEnum.TEXT,
      QuestionOptionsEnum.EPI_CA,
      QuestionOptionsEnum.PHOTO,
    ];

    return Object.values(questionOptionsConstant).filter(
      (q: any) => personalized.includes(q.value) || !keepOnlyPersonalized,
    ) as IQuestionOptions[];
  }, [keepOnlyPersonalized]);

  const actualQuestionOption =
    questionOptionsConstant[node?.answerType || QuestionOptionsEnum.DEFAULT];

  return (
    <STagSelect
      options={options}
      text={''}
      large={large}
      icon={actualQuestionOption.icon}
      handleSelectMenu={handleSelectOption}
      tooltipProps={(option: any) => ({ title: option.desc, minLength: 1 })}
      {...props}
    />
  );
};
