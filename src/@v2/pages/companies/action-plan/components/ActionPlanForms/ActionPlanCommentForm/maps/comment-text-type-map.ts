import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';

type CharacterizationTypeMapValue = {
  label: string;
};

export const CommnetTextTypeMap: Record<
  CommentTextTypeEnum,
  CharacterizationTypeMapValue
> = {
  [CommentTextTypeEnum.LOGISTICS]: { label: 'Inviabilidade de Logística' },
  [CommentTextTypeEnum.MONEY]: { label: 'Inviabilidade Financeira' },
  [CommentTextTypeEnum.TECHNIQUE]: { label: 'Inviabilidade Técnica' },
  [CommentTextTypeEnum.OTHER]: { label: 'Outros' },
};

export const CommnetTextTypeMapList = Object.entries(CommnetTextTypeMap).map(
  ([value, { label }]) => ({
    value: value as CommentTextTypeEnum,
    label,
  }),
);
