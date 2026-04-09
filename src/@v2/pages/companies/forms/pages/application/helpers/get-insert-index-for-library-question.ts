import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { IFormIdentifierItem } from '../schema/form-application.schema';

/**
 * Insere após a pergunta estrutural de setor (psicossocial), se existir;
 * caso contrário, no fim da lista.
 */
export function getInsertIndexForLibraryQuestion(
  items: IFormIdentifierItem[],
  formType: FormTypeEnum | undefined,
): number {
  if (formType === FormTypeEnum.PSYCHOSOCIAL) {
    const sectorIndex = items.findIndex(
      (i) => i.type.value === FormIdentifierTypeEnum.SECTOR,
    );
    if (sectorIndex >= 0) {
      return sectorIndex + 1;
    }
  }
  return items.length;
}
