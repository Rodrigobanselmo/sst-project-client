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
  ...props
}) => {
  const { preventMultipleTextOptions } = usePreventNode();

  const handleSelectOption = ({ name, value }: IMenuOptionResponse) => {
    const VALUE = value as QuestionOptionsEnum;

    if (preventMultipleTextOptions(node, VALUE)) return;

    handleSelect && handleSelect({ value: VALUE as QuestionOptionsEnum, name });
  };

  const options = useMemo(() => {
    return Object.values(questionOptionsConstant) as IQuestionOptions[];
  }, []);

  const actualQuestionOption =
    questionOptionsConstant[node?.answerType || QuestionOptionsEnum.ONE_ANSWER];

  return (
    <STagSelect
      options={options}
      text={''}
      large={large}
      icon={actualQuestionOption.icon}
      handleSelectMenu={handleSelectOption}
      {...props}
    />
  );
};
