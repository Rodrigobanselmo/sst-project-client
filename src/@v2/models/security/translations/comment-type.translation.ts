import { CommentTypeEnum } from '../enums/comment-type.enum';

type CommentTypeTranslationMap = Record<CommentTypeEnum, string>;

export const commentTypeTranslation: CommentTypeTranslationMap = {
  [CommentTypeEnum.PROGRESS]: 'Iniciado',
  [CommentTypeEnum.CANCELED]: 'Cancelado',
  [CommentTypeEnum.DONE]: 'Concluído',
  [CommentTypeEnum.POSTPONED]: 'Adiado',
};
