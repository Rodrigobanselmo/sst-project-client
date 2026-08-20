import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

/** GSE técnico: HomogeneousGroup.type = null, sem caracterização/ambiente/hierarquia. */
export function isTechnicalGse(
  gho: Pick<IGho, 'type' | 'characterization' | 'environment'>,
): boolean {
  if (gho.type != null && gho.type !== HomoTypeEnum.GSE) return false;
  if (gho.characterization) return false;
  if (gho.environment) return false;
  return true;
}

export function filterTechnicalGses<
  T extends Pick<IGho, 'type' | 'characterization' | 'environment'>,
>(rows: T[]): T[] {
  return rows.filter((row) => isTechnicalGse(row));
}
