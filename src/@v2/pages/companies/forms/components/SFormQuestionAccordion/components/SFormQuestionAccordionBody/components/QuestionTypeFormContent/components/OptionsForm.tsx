import { QuestionOptionsManager } from '../../QuestionOptionsManager/QuestionOptionsManager';

interface OptionsFormProps {
  sectionIndex: number;
  questionIndex: number;
}

export const OptionsForm = ({
  sectionIndex,
  questionIndex,
}: OptionsFormProps) => {
  return (
    <QuestionOptionsManager
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
    />
  );
};
