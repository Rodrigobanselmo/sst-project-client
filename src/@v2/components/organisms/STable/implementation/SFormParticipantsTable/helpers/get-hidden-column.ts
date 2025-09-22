import { FormParticipantsColumnsEnum } from '../enums/form-participants-columns.enum';

export const getHiddenColumn = (
  hiddenColumns: Record<FormParticipantsColumnsEnum, boolean>,
  column: FormParticipantsColumnsEnum,
) => {
  return hiddenColumns[column];
};
