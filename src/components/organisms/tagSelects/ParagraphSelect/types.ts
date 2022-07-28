import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

export interface IParagraphSelectProps extends Partial<ISTagSelectProps> {
  selected: ParagraphEnum;
  paragraphOptions: ParagraphEnum[];
}
