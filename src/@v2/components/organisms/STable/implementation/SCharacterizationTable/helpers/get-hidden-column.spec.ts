/**
 * Contrato 2E.1 — Criação / Últ. Edição ocultas por padrão, sem sobrescrever preferência.
 *
 * Executar:
 * npx tsx src/@v2/components/organisms/STable/implementation/SCharacterizationTable/helpers/get-hidden-column.spec.ts
 */
import assert from 'node:assert/strict';

import { CharacterizationColumnsEnum as columnsEnum } from '../enums/characterization-columns.enum';
import { CharacterizationColumnMap } from '../maps/characterization-column-map';
import { getHiddenColumn } from './get-hidden-column';

assert.equal(CharacterizationColumnMap[columnsEnum.CREATED_AT].startHidden, true);
assert.equal(CharacterizationColumnMap[columnsEnum.UPDATED_AT].startHidden, true);
assert.equal(
  CharacterizationColumnMap[columnsEnum.TECHNICAL_CONTENT].startHidden,
  undefined,
);
assert.equal(
  CharacterizationColumnMap[columnsEnum.ENVIRONMENTAL_PARAMS].startHidden,
  undefined,
);

/** Sem preferência salva → oculta por startHidden. */
assert.equal(
  getHiddenColumn({} as Record<columnsEnum, boolean>, columnsEnum.CREATED_AT),
  true,
);
assert.equal(
  getHiddenColumn({} as Record<columnsEnum, boolean>, columnsEnum.UPDATED_AT),
  true,
);

/** Outras colunas permanecem visíveis no estado inicial. */
assert.equal(
  getHiddenColumn({} as Record<columnsEnum, boolean>, columnsEnum.NAME),
  false,
);
assert.equal(
  getHiddenColumn(
    {} as Record<columnsEnum, boolean>,
    columnsEnum.TECHNICAL_CONTENT,
  ),
  false,
);
assert.equal(
  getHiddenColumn(
    {} as Record<columnsEnum, boolean>,
    columnsEnum.ENVIRONMENTAL_PARAMS,
  ),
  false,
);

/** Preferência explícita do usuário prevalece. */
assert.equal(
  getHiddenColumn(
    { [columnsEnum.CREATED_AT]: false } as Record<columnsEnum, boolean>,
    columnsEnum.CREATED_AT,
  ),
  false,
);
assert.equal(
  getHiddenColumn(
    { [columnsEnum.CREATED_AT]: true } as Record<columnsEnum, boolean>,
    columnsEnum.CREATED_AT,
  ),
  true,
);
assert.equal(
  getHiddenColumn(
    { [columnsEnum.UPDATED_AT]: false } as Record<columnsEnum, boolean>,
    columnsEnum.UPDATED_AT,
  ),
  false,
);

console.log('get-hidden-column.spec.ts OK');
