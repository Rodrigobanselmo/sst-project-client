import { CommentTextTypeEnum } from '../enums/comment-text-type.enum';

type CommentTextTypeTranslationMap = Record<CommentTextTypeEnum, string>;

export const commentTextTypeTranslation: CommentTextTypeTranslationMap = {
  [CommentTextTypeEnum.LOGISTICS]: 'Logística',
  [CommentTextTypeEnum.MONEY]: 'Inv. Financeira',
  [CommentTextTypeEnum.TECHNIQUE]: 'Inv. Técnica',
  [CommentTextTypeEnum.OTHER]: 'Outros',
};
