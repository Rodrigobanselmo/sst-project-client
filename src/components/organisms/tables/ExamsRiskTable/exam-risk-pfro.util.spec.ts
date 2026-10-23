import { ergonomicFilterOptions, matchesPfro, pfroLabel } from './exam-risk-pfro.util';
import { sortOverviewRisks } from './exam-risk-overview.util';
const risk = (id: string, name: string, sub?: { id: string; name: string }, type = 'ERG') => ({ riskId: id, riskName: name, riskGroup: { id: type, name: type === 'ERG' ? 'Ergonômico' : 'Químico' }, riskSubgroup: sub ?? null }) as any;
const psycho = { id: '12', name: 'Psicossocial' };
it('uses structural names including dynamically registered subtypes, never risk-name keywords', () => {
 expect(pfroLabel(risk('a', 'Qualquer risco', psycho))).toBe('ERG – Psicossocial');
 expect(pfroLabel(risk('a', 'Psicossocial'))).toBe('ERG');
 expect(pfroLabel(risk('a', 'Qualquer', { id: '55', name: 'Nome cadastrado' }))).toBe('ERG – Nome cadastrado');
 expect(pfroLabel(risk('a', 'Qualquer', { id: '', name: 'Psicossocial' }))).toBe('ERG');
 expect(pfroLabel(risk('a', 'Qualquer', psycho, 'QUI'))).toBe('QUI');
});
it('filters all ergonomics or a single structural subtype and builds unique real options', () => {
 const rows = [risk('a', 'A', psycho), risk('b', 'B', psycho), risk('c', 'C'), risk('d', 'D', psycho, 'QUI')];
 expect(rows.filter(row => matchesPfro(row, 'ERG')).map(row => row.riskId)).toEqual(['a', 'b', 'c']);
 expect(rows.filter(row => matchesPfro(row, 'ERG:12')).map(row => row.riskId)).toEqual(['a', 'b']);
 expect(ergonomicFilterOptions(rows)).toEqual([psycho]);
});
it.each(['asc', 'desc'] as const)('sorts type, ergonomic subtype, then name (%s)', direction => {
 const rows = [risk('q', 'A', undefined, 'QUI'), risk('pZ', 'Z', psycho), risk('bZ', 'Z', { id: '1', name: 'Biomecânicos' }), risk('pA', 'A', psycho), risk('bA', 'A', { id: '1', name: 'Biomecânicos' })];
 const expected = ['bA', 'bZ', 'pA', 'pZ', 'q'];
 if (direction === 'desc') expected.reverse();
 expect(sortOverviewRisks(rows, { field: 'riskName', direction }).map(row => row.riskId)).toEqual(expected);
});

it('accepts optional group and subgroup IDs from the coverage contract without inventing identities', () => {
 const withoutGroupId = { riskGroup: { name: 'Ergonômico' }, riskSubgroup: { name: 'Psicossocial' } };
 const withoutSubgroupId = { riskGroup: { id: 'ERG', name: 'Ergonômico' }, riskSubgroup: { name: 'Psicossocial' } };
 expect(pfroLabel(withoutGroupId)).toBeUndefined();
 expect(matchesPfro(withoutGroupId, 'ERG')).toBe(false);
 expect(matchesPfro(withoutGroupId, '')).toBe(true);
 expect(pfroLabel(withoutSubgroupId)).toBe('ERG');
 expect(matchesPfro(withoutSubgroupId, 'ERG:12')).toBe(false);
 expect(ergonomicFilterOptions([withoutGroupId, withoutSubgroupId])).toEqual([]);
});
