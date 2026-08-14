/**
 * Testes pontuais da busca do seletor compartilhado de fatores de risco.
 * Executar com: npx tsx --test src/core/utils/risk-select-search.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import diacritics from 'diacritics';
import Fuse from 'fuse.js';

import { resolveFuseSearchQuery } from '../../components/molecules/SMenuSearch/resolve-fuse-search-query';
import {
  compactCasDigits,
  looksLikeCasQuery,
  mapRiskSelectSearchFields,
  normalizeRiskSelectSearchQuery,
  normalizeSynonymousList,
  RISK_SELECT_FUSE_KEYS,
  toRiskSelectDomainOption,
} from './risk-select-search.util';

const ANIDRO_ID = '0f059d6f-ff94-4a81-b591-2caf684aaa39';

const anidroOriginal = {
  id: ANIDRO_ID,
  name: 'Anidro sulfuroso (Agente Insalubre)',
  type: 'QUI',
  representAll: false,
  cas: '7446-09-5',
  synonymous: ['Dióxido de enxofre', 'Sulfur oxide, SOx, SO2'],
  search: 'anidro sulfuroso dioxido de enxofre',
};

function removeAccents(obj: unknown) {
  if (typeof obj === 'string') {
    return obj.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  return obj;
}

function searchRiskSelect<T>(options: T[], query: string): T[] {
  const fuse = new Fuse(options, {
    keys: [...RISK_SELECT_FUSE_KEYS],
    getFn: (obj, path) => {
      const value = Fuse.config.getFn(obj, path);
      if (Array.isArray(value)) {
        return value.map((el) => removeAccents(el) as string);
      }
      return removeAccents(value) as string;
    },
    ignoreLocation: true,
  });

  return fuse
    .search(diacritics.remove(normalizeRiskSelectSearchQuery(query)))
    .map((result) => result.item);
}

function resolveSelectedRisk<T extends { id: string; casDigits?: string }>(
  originals: Omit<T, 'casDigits'>[],
  selected: T,
): Omit<T, 'casDigits'> {
  return (
    originals.find((risk) => risk.id === selected.id) ??
    toRiskSelectDomainOption(selected)
  );
}

const originals = [
  anidroOriginal,
  {
    id: 'fis-ruido',
    name: 'Ruído',
    type: 'FIS',
    representAll: false,
    cas: '',
    synonymous: [] as string[],
    search: 'ruido',
  },
  {
    id: 'aci-queda',
    name: 'Queda de mesmo nível',
    type: 'ACI',
    representAll: false,
    cas: '',
    synonymous: [] as string[],
    search: '',
  },
  {
    id: 'represent-all-qui',
    name: 'Todos os químicos',
    type: 'QUI',
    representAll: true,
    cas: '',
    synonymous: [] as string[],
    search: '',
  },
];

const catalog = originals.map(mapRiskSelectSearchFields);

describe('risk-select-search.util', () => {
  it('compacta CAS removendo não-dígitos', () => {
    assert.equal(compactCasDigits('7446-09-5'), '7446095');
    assert.equal(compactCasDigits('7446095'), '7446095');
    assert.equal(compactCasDigits(''), '');
  });

  it('query textual comum não sofre compactação numérica', () => {
    assert.equal(looksLikeCasQuery('Dióxido de enxofre'), false);
    assert.equal(looksLikeCasQuery('Anidro sulfuroso'), false);
    assert.equal(looksLikeCasQuery('Ruído'), false);
    assert.equal(
      normalizeRiskSelectSearchQuery('Dióxido de enxofre'),
      'Dióxido de enxofre',
    );
    assert.equal(
      normalizeRiskSelectSearchQuery('Anidro sulfuroso'),
      'Anidro sulfuroso',
    );
    assert.equal(normalizeRiskSelectSearchQuery('Ruído'), 'Ruído');
  });

  it('só compacta queries com perfil de CAS/números', () => {
    assert.equal(looksLikeCasQuery('7446-09-5'), true);
    assert.equal(looksLikeCasQuery('7446095'), true);
    assert.equal(normalizeRiskSelectSearchQuery('7446-09-5'), '7446095');
    assert.equal(normalizeRiskSelectSearchQuery('7446095'), '7446095');
  });

  it('normaliza synonymous array/string/JSON sem alterar o contrato', () => {
    assert.deepEqual(normalizeSynonymousList(['Dióxido de enxofre']), [
      'Dióxido de enxofre',
    ]);
    assert.deepEqual(normalizeSynonymousList('Dióxido de enxofre'), [
      'Dióxido de enxofre',
    ]);
    assert.deepEqual(
      normalizeSynonymousList('["Dióxido de enxofre","SO2"]'),
      ['Dióxido de enxofre', 'SO2'],
    );
    assert.deepEqual(normalizeSynonymousList(undefined), []);
  });

  it('preserva campos reais e deriva casDigits só para o Fuse', () => {
    const mapped = mapRiskSelectSearchFields(anidroOriginal);

    assert.equal(mapped.cas, '7446-09-5');
    assert.equal(mapped.casDigits, '7446095');
    assert.deepEqual(mapped.synonymous, anidroOriginal.synonymous);
    assert.equal(mapped.search, anidroOriginal.search);
    assert.equal(mapped.name, anidroOriginal.name);
    assert.equal(mapped.id, anidroOriginal.id);
  });

  it('objeto devolvido ao consumidor não contém casDigits', () => {
    const indexed = mapRiskSelectSearchFields(anidroOriginal);
    const returned = resolveSelectedRisk([anidroOriginal], indexed);

    assert.equal('casDigits' in indexed, true);
    assert.equal('casDigits' in returned, false);
    assert.equal(returned, anidroOriginal);
    assert.deepEqual(toRiskSelectDomainOption(indexed), anidroOriginal);
  });
});

describe('transformSearch opcional do SMenuSearch', () => {
  it('consumidor sem transformSearch mantém a query original', () => {
    assert.equal(resolveFuseSearchQuery('7446-09-5'), '7446-09-5');
    assert.equal(resolveFuseSearchQuery('Dióxido de enxofre'), 'Dióxido de enxofre');
    assert.equal(resolveFuseSearchQuery('Anidro sulfuroso'), 'Anidro sulfuroso');
  });

  it('apenas o RiskSelect aplica a compactação de CAS', () => {
    assert.equal(
      resolveFuseSearchQuery('7446-09-5', normalizeRiskSelectSearchQuery),
      '7446095',
    );
    assert.equal(
      resolveFuseSearchQuery(
        'Dióxido de enxofre',
        normalizeRiskSelectSearchQuery,
      ),
      'Dióxido de enxofre',
    );
  });
});

describe('RiskSelect Fuse homologação Anidro sulfuroso', () => {
  const queries = [
    '7446-09-5',
    '7446095',
    'Dióxido de enxofre',
    'Anidro sulfuroso',
  ];

  for (const query of queries) {
    it(`"${query}" encontra o RiskFactor canônico existente`, () => {
      const results = searchRiskSelect(catalog, query);
      assert.ok(results.length > 0, `nenhum resultado para ${query}`);
      assert.equal(results[0].id, ANIDRO_ID);
      assert.equal(results[0].name, 'Anidro sulfuroso (Agente Insalubre)');
      assert.equal(results.filter((item) => item.id === ANIDRO_ID).length, 1);

      const returned = resolveSelectedRisk(originals, results[0]);
      assert.equal(returned, anidroOriginal);
      assert.equal('casDigits' in returned, false);
    });
  }

  it('filtro QUI continua restringindo o catálogo', () => {
    const qui = catalog.filter((risk) => risk.type === 'QUI');
    assert.ok(qui.some((risk) => risk.id === ANIDRO_ID));
    assert.ok(!qui.some((risk) => risk.id === 'fis-ruido'));
    assert.ok(qui.every((risk) => risk.type === 'QUI'));
  });

  it('riscos físicos e acidentais continuam pesquisáveis por nome', () => {
    const ruido = searchRiskSelect(catalog, 'Ruído');
    assert.equal(ruido[0]?.id, 'fis-ruido');

    const queda = searchRiskSelect(catalog, 'Queda de mesmo nível');
    assert.equal(queda[0]?.id, 'aci-queda');
  });

  it('não cria opção duplicada a partir do sinônimo', () => {
    const names = catalog.map((risk) => risk.name);
    assert.equal(
      names.filter((name) => name === 'Dióxido de enxofre').length,
      0,
    );
  });
});
