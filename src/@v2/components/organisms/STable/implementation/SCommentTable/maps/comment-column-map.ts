import { STableColumnsProps } from '../../../addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton.types';
import { CommentColumnsEnum } from '../enums/comment-columns.enum';

type CommentTypeMapValue = {
  label: string;
  alwaysVisible?: boolean;
  startHidden?: boolean;
};

export const CommentColumnMap: Record<CommentColumnsEnum, CommentTypeMapValue> =
  {
    [CommentColumnsEnum.CHECK_BOX]: { label: '', alwaysVisible: true },
    [CommentColumnsEnum.TEXT]: { label: 'Comentário', alwaysVisible: true },
    [CommentColumnsEnum.ORIGIN]: { label: 'Origem' },
    [CommentColumnsEnum.RECCOMENDATION]: { label: 'Recomendação' },
    [CommentColumnsEnum.TEXT_TYPE]: { label: 'Motivo', startHidden: true },
    [CommentColumnsEnum.TYPE]: { label: 'Tipo' },
    [CommentColumnsEnum.CREATED_BY]: { label: 'Criado por' },
    [CommentColumnsEnum.APPROVED]: { label: 'Status' },
    [CommentColumnsEnum.CHANGES]: { label: 'Alteração' },
    [CommentColumnsEnum.APPROVED_BY]: { label: 'Aprovado por' },
    [CommentColumnsEnum.CREATED_AT]: { label: 'Criado', startHidden: true },
    [CommentColumnsEnum.UPDATED_AT]: {
      label: 'Atualizado',
      startHidden: true,
    },
  };

export const commentColumns = Object.entries(CommentColumnMap)
  .filter(([, { alwaysVisible }]) => !alwaysVisible)
  .map<STableColumnsProps>(([value, { label, startHidden }]) => ({
    value,
    label,
    startHidden,
  }));
