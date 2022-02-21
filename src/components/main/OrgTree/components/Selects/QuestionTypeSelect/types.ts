import { BoxProps } from '@mui/material';
import { QuestionOptionsEnum } from 'components/main/OrgTree/enums/question-options.enums';

import { ITreeMapObject, ITreeSelectedItem } from '../../../interfaces';

export interface IQuestionTypeSelectSelectProps extends BoxProps {
  node: ITreeMapObject | ITreeSelectedItem;
  large?: boolean;
  handleSelect?: (option: { value: QuestionOptionsEnum; name: string }) => void;
  keepOnlyPersonalized?: boolean;
}
