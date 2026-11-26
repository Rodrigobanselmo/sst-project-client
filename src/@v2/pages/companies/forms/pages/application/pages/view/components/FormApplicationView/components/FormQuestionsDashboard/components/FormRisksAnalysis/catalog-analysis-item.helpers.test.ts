import assert from 'node:assert/strict';
import { it } from 'node:test';
import { selectCatalogAnalysisItem } from './catalog-analysis-item.helpers';
const entry = (n: number) => ({ nome: `Medida ${n}`, catalogId: `id${n}`, origem: 'sistema' as const, justificativa: 'Original' });
const content = () => ({ fontesGeradoras: [entry(0)], medidasEngenhariaRecomendadas: [], medidasAdministrativasRecomendadas: [entry(1), entry(2), entry(3), entry(4)] });
it('adds manual catalogue choices beyond the AI generation limit without mutating the original', () => {
  const original = content(); const result = selectCatalogAnalysisItem(original, 'medidasAdministrativasRecomendadas', { id: 'id5', name: 'Medida 5' });
  assert.equal(result.medidasAdministrativasRecomendadas.length, 5);
  assert.equal(original.medidasAdministrativasRecomendadas.length, 4);
  assert.deepEqual(result.fontesGeradoras, original.fontesGeradoras);
});
it('rejects duplicates across lists and replaces only the selected entry', () => {
  assert.throws(() => selectCatalogAnalysisItem(content(), 'medidasAdministrativasRecomendadas', { id: 'other', name: ' MEDIDA 0 ' }));
  const result = selectCatalogAnalysisItem(content(), 'medidasAdministrativasRecomendadas', { id: 'id6', name: 'Medida 6' }, 1);
  assert.equal(result.medidasAdministrativasRecomendadas[1].catalogId, 'id6');
  assert.equal(result.medidasAdministrativasRecomendadas[0].catalogId, 'id1');
  assert.throws(() => selectCatalogAnalysisItem(content(), 'fontesGeradoras', { id: 'id7', name: 'Fonte 7' }, 3));
});
