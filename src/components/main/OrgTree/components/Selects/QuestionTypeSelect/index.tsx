/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useMemo } from 'react';

import { QuestionOptionsEnum } from 'components/main/OrgTree/enums/question-options.enums';
import { usePreventNode } from 'components/main/OrgTree/hooks/usePreventNode';
import { IMenuOptionResponse } from 'components/molecules/SMenu/types';
import { STagSelect } from 'components/molecules/STagSelect';

import {
  IQuestionOptions,
  questionOptionsConstant,
} from './constants/question-options.constant';
import { IQuestionTypeSelectSelectProps } from './types';

export const QuestionTypeSelect: FC<IQuestionTypeSelectSelectProps> = ({
  large,
  handleSelect,
  node,
  keepOnlyPersonalized,
  ...props
}) => {
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
