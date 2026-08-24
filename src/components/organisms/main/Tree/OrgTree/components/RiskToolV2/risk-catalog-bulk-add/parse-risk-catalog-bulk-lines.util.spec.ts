/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-bulk-add/parse-risk-catalog-bulk-lines.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  filterNamesAlreadyLinked,
  parseRiskCatalogBulkLines,
} from './parse-risk-catalog-bulk-lines.util';

const sample = `Plano de Emergência e Abandono de Área
Brigada de incêndio constituída e treinada

Definição e divulgação das rotas de fuga
Plano de Emergência e Abandono de Área
`;

const parsed = parseRiskCatalogBulkLines(sample);
assert.equal(parsed.items.length, 3);
assert.equal(parsed.duplicateCount, 1);
assert.ok(parsed.emptyCount >= 1);
assert.equal(
  parsed.items[0],
  'Plano de Emergência e Abandono de Área',
);

const single = parseRiskCatalogBulkLines('Uma única linha');
assert.deepEqual(single.items, ['Uma única linha']);
assert.equal(single.duplicateCount, 0);

const empties = parseRiskCatalogBulkLines('\n  \n\t\n');
assert.deepEqual(empties.items, []);
assert.ok(empties.emptyCount >= 3);

const twentyOne = `Plano de Emergência e Abandono de Área
Brigada de incêndio constituída e treinada
Realização periódica de simulados de evacuação/abandono
Definição e divulgação das rotas de fuga
Definição de ponto(s) de encontro
Orientação dos ocupantes quanto aos procedimentos de emergência
Inspeções periódicas dos sistemas e equipamentos de combate a incêndio
Manutenção preventiva das instalações e equipamentos elétricos
Manutenção e inspeção periódica dos sistemas de detecção e alarme
Manutenção das rotas de fuga permanentemente livres e desobstruídas
Procedimento de abandono do edifício por escadas em situações de emergência
Orientação/proibição de utilização dos elevadores durante situações de incêndio
Treinamentos e campanhas de prevenção e resposta a emergências
Inspeções periódicas das instalações elétricas e quadros de distribuição
Controle de acesso às áreas técnicas
Manutenção preventiva dos sistemas de climatização
Controle de armazenamento de materiais combustíveis e inflamáveis
Procedimento/permissão para trabalhos a quente
Controle de contratadas durante intervenções e serviços de manutenção
Registro, investigação e tratamento de princípios de incêndio e demais ocorrências
Procedimentos específicos para emergências em garagens, subsolos e áreas técnicas`;

const parsedTwentyOne = parseRiskCatalogBulkLines(twentyOne);
assert.equal(parsedTwentyOne.items.length, 21);
assert.equal(parsedTwentyOne.duplicateCount, 0);

const linked = filterNamesAlreadyLinked(
  ['Brigada de incêndio constituída e treinada', 'Item novo'],
  ['brigada de incendio constituida e treinada'],
);
assert.deepEqual(linked.toAdd, ['Item novo']);
assert.equal(linked.alreadyLinkedCount, 1);

console.log('parse-risk-catalog-bulk-lines.util.spec.ts ok');
