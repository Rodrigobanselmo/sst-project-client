import { ParagraphEnum } from 'project/enum/paragraph.enum';

export interface IParagraphOption {
  value: ParagraphEnum;
  name: string;
  mark: string;
}

interface IParagraphOptions extends Record<ParagraphEnum, IParagraphOption> {}
ParagraphEnum;
export const paragraphOptionsConstant = {
  [ParagraphEnum.PARAGRAPH]: {
    value: ParagraphEnum.PARAGRAPH,
    name: 'Parágrafo',
    mark: 'p',
  },
  [ParagraphEnum.BULLET_0]: {
    value: ParagraphEnum.BULLET_0,
    name: 'Marcador nivel 1', //●
    mark: 'n1',
  },
  [ParagraphEnum.BULLET_1]: {
    value: ParagraphEnum.BULLET_1,
    name: 'Marcador nivel 2',
    mark: 'n2',
  },
  [ParagraphEnum.BULLET_2]: {
    value: ParagraphEnum.BULLET_2,
    name: 'Marcador nivel 3',
    mark: 'n3',
  },
  [ParagraphEnum.BULLET_3]: {
    value: ParagraphEnum.BULLET_3,
    name: 'Marcador nivel 4',
    mark: 'n4',
  },
  [ParagraphEnum.BULLET_4]: {
    value: ParagraphEnum.BULLET_4,
    name: 'Marcador nivel 5',
    mark: 'n5',
  },
} as IParagraphOptions;
