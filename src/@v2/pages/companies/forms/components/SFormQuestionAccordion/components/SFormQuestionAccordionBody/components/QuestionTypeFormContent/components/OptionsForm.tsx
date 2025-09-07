import { QuestionOptionsManager } from '../../QuestionOptionsManager/QuestionOptionsManager';

interface OptionsFormProps {
  sectionIndex: number;
  questionIndex: number;
  disableQuestionValue?: boolean;
}

export const OptionsForm = ({
  sectionIndex,
  questionIndex,
  disableQuestionValue = false,
}: OptionsFormProps) => {
  return (
    <QuestionOptionsManager
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
      disableQuestionValue={disableQuestionValue}
    />
  );
};
