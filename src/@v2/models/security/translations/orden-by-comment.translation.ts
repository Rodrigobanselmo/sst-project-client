import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';

type OrderByTranslationMap = Record<CommentOrderByEnum, string>;

export const ordenByCommentTranslation: OrderByTranslationMap = {
  [CommentOrderByEnum.CREATED_AT]: 'data de criação',
  [CommentOrderByEnum.UPDATED_AT]: 'data de atualização',
  [CommentOrderByEnum.CREATOR]: 'criado por',
  [CommentOrderByEnum.IS_APPROVED]: 'aprovado',
  [CommentOrderByEnum.APPROVED_BY]: 'aprovado por',
  [CommentOrderByEnum.TEXT_TYPE]: 'tipo',
  [CommentOrderByEnum.TYPE]: 'tipo',
};
