import { QuestionOptionsManager } from '../../QuestionOptionsManager/QuestionOptionsManager';

interface OptionsFormProps {
  sectionIndex: number;
  questionIndex: number;
  disableQuestionValue?: boolean;
  structureFrozen?: boolean;
}

export const OptionsForm = ({
  sectionIndex,
  questionIndex,
  disableQuestionValue = false,
  structureFrozen = false,
}: OptionsFormProps) => {
  return (
    <QuestionOptionsManager
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
      disableQuestionValue={disableQuestionValue}
      structureFrozen={structureFrozen}
    />
  );
};
